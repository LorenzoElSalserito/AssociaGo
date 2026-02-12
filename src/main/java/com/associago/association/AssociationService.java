package com.associago.association;

import com.associago.association.repository.AssociationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AssociationService {

    private final AssociationRepository associationRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AssociationService(AssociationRepository associationRepository, PasswordEncoder passwordEncoder) {
        this.associationRepository = associationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Association> findAll() {
        return associationRepository.findAll();
    }

    public Optional<Association> findById(Long id) {
        return associationRepository.findById(id);
    }

    public Optional<Association> findBySlug(String slug) {
        return associationRepository.findBySlug(slug);
    }

    @Transactional
    public Association create(Association association) {
        if (associationRepository.findBySlug(association.getSlug()).isPresent()) {
            throw new IllegalArgumentException("Slug already exists: " + association.getSlug());
        }
        // Hash the password before saving
        if (association.getPassword() != null && !association.getPassword().isEmpty()) {
            association.setPassword(passwordEncoder.encode(association.getPassword()));
        }
        return associationRepository.save(association);
    }

    @Transactional
    public Association update(Long id, Association updatedAssociation) {
        return associationRepository.findById(id)
                .map(existing -> {
                    // Update fields
                    existing.setName(updatedAssociation.getName());
                    existing.setEmail(updatedAssociation.getEmail());
                    existing.setTaxCode(updatedAssociation.getTaxCode());
                    existing.setVatNumber(updatedAssociation.getVatNumber());
                    existing.setType(updatedAssociation.getType());
                    existing.setAddress(updatedAssociation.getAddress());
                    existing.setCity(updatedAssociation.getCity());
                    existing.setProvince(updatedAssociation.getProvince());
                    existing.setZipCode(updatedAssociation.getZipCode());
                    existing.setPhone(updatedAssociation.getPhone());
                    existing.setDescription(updatedAssociation.getDescription());
                    
                    existing.setPresident(updatedAssociation.getPresident());
                    existing.setVicePresident(updatedAssociation.getVicePresident());
                    existing.setSecretary(updatedAssociation.getSecretary());
                    existing.setTreasurer(updatedAssociation.getTreasurer());
                    
                    existing.setFoundationDate(updatedAssociation.getFoundationDate());
                    existing.setMembershipNumberFormat(updatedAssociation.getMembershipNumberFormat());
                    existing.setBaseMembershipFee(updatedAssociation.getBaseMembershipFee());
                    
                    // DB Config
                    existing.setUseRemoteDb(updatedAssociation.isUseRemoteDb());
                    existing.setDbType(updatedAssociation.getDbType());
                    existing.setDbHost(updatedAssociation.getDbHost());
                    existing.setDbPort(updatedAssociation.getDbPort());
                    existing.setDbName(updatedAssociation.getDbName());
                    existing.setDbUser(updatedAssociation.getDbUser());
                    existing.setDbPassword(updatedAssociation.getDbPassword());
                    existing.setDbSsl(updatedAssociation.isDbSsl());

                    // Logo (if provided)
                    if (updatedAssociation.getLogo() != null) {
                        existing.setLogo(updatedAssociation.getLogo());
                    }
                    
                    // Update password only if provided and not empty
                    if (updatedAssociation.getPassword() != null && !updatedAssociation.getPassword().isEmpty()) {
                        existing.setPassword(passwordEncoder.encode(updatedAssociation.getPassword()));
                    }

                    return associationRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Association not found with id: " + id));
    }

    @Transactional
    public void updateLogo(Long id, byte[] logoData) {
        associationRepository.findById(id).ifPresent(assoc -> {
            assoc.setLogo(logoData);
            associationRepository.save(assoc);
        });
    }

    @Transactional(readOnly = true)
    public byte[] getLogo(Long id) {
        return associationRepository.findById(id)
                .map(Association::getLogo)
                .orElse(null);
    }

    @Transactional
    public void delete(Long id) {
        associationRepository.deleteById(id);
    }
}
