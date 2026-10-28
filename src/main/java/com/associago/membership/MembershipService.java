package com.associago.membership;

import com.associago.membership.repository.UserAssociationRepository;
import com.associago.notification.NotificationService;
import com.associago.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MembershipService {

    private final UserAssociationRepository userAssociationRepository;
    private final NotificationService notificationService;

    @Autowired
    public MembershipService(UserAssociationRepository userAssociationRepository, NotificationService notificationService) {
        this.userAssociationRepository = userAssociationRepository;
        this.notificationService = notificationService;
    }

    public List<UserAssociation> findByAssociationId(Long associationId) {
        return userAssociationRepository.findByAssociationId(associationId);
    }

    public Optional<UserAssociation> findById(Long id) {
        return userAssociationRepository.findById(id);
    }

    @Transactional
    public UserAssociation save(UserAssociation membership) {
        return userAssociationRepository.save(membership);
    }

    @Transactional
    public void deleteById(Long id) {
        userAssociationRepository.deleteById(id);
    }

    @Transactional
    public UserAssociation renewMembership(Long membershipId, LocalDate newExpirationDate) {
        return userAssociationRepository.findById(membershipId).map(membership -> {
            membership.setExpirationDate(newExpirationDate);
            membership.setLastRenewalDate(LocalDate.now());
            membership.setStatus("ACTIVE");
            
            notifyMembership(membership, "notifications.messages.membershipRenewed", newExpirationDate, "INFO");
            
            return userAssociationRepository.save(membership);
        }).orElseThrow(() -> new RuntimeException("Membership not found"));
    }

    @Scheduled(cron = "0 0 1 * * ?") // Run every day at 1 AM
    @Transactional
    public void checkAndUpdateStatus() {
        List<UserAssociation> all = userAssociationRepository.findAll();
        LocalDate now = LocalDate.now();
        
        for (UserAssociation ua : all) {
            // Check for expiration
            if (ua.getExpirationDate() != null && ua.getExpirationDate().isBefore(now) && "ACTIVE".equals(ua.getStatus())) {
                ua.setStatus("EXPIRED");
                userAssociationRepository.save(ua);
                
                notifyMembership(ua, "notifications.messages.membershipExpired", ua.getExpirationDate(), "WARNING");
            }
            
            // Check for upcoming expiration (e.g., in 7 days)
            if (ua.getExpirationDate() != null && "ACTIVE".equals(ua.getStatus())) {
                LocalDate warningDate = ua.getExpirationDate().minusDays(7);
                if (now.equals(warningDate)) {
                    notifyMembership(ua, "notifications.messages.membershipExpiring", ua.getExpirationDate(), "REMINDER");
                }
            }
        }
    }

    private void notifyMembership(UserAssociation membership, String key, LocalDate date, String type) {
        User user = membership.getUser();
        String name = user == null ? "" : ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                + (user.getLastName() == null ? "" : user.getLastName())).trim();
        notificationService.notifyAssociation(
            membership.getAssociation() != null ? membership.getAssociation().getId() : null,
            user != null ? user.getId() : null,
            key,
            Map.of("name", name, "date", date == null ? "" : date.toString()),
            type,
            "MEMBERSHIP",
            membership.getId()
        );
    }
}
