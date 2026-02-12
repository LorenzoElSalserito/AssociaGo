package com.associago.membership;

import com.associago.membership.repository.UserAssociationRepository;
import com.associago.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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
            
            // Notify user
            notificationService.createNotification(
                membership.getUser().getId(),
                "Rinnovo Tessera",
                "La tua tessera è stata rinnovata fino al " + newExpirationDate,
                "INFO",
                "MEMBERSHIP",
                membership.getId()
            );
            
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
                
                // Notify user of expiration
                notificationService.createNotification(
                    ua.getUser().getId(),
                    "Tessera Scaduta",
                    "La tua tessera associativa è scaduta il " + ua.getExpirationDate(),
                    "WARNING",
                    "MEMBERSHIP",
                    ua.getId()
                );
            }
            
            // Check for upcoming expiration (e.g., in 7 days)
            if (ua.getExpirationDate() != null && "ACTIVE".equals(ua.getStatus())) {
                LocalDate warningDate = ua.getExpirationDate().minusDays(7);
                if (now.equals(warningDate)) {
                    notificationService.createNotification(
                        ua.getUser().getId(),
                        "Tessera in Scadenza",
                        "La tua tessera scadrà tra 7 giorni (" + ua.getExpirationDate() + ")",
                        "REMINDER",
                        "MEMBERSHIP",
                        ua.getId()
                    );
                }
            }
        }
    }
}
