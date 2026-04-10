package com.associago.association;

import com.associago.association.repository.AssociationLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssociationLocationService {

    private final AssociationLocationRepository locationRepository;

    public AssociationLocationService(AssociationLocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<AssociationLocation> findByAssociationId(Long associationId) {
        return locationRepository.findByAssociationId(associationId);
    }

    public AssociationLocation findById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found: " + id));
    }

    @Transactional
    public AssociationLocation create(AssociationLocation location) {
        return locationRepository.save(location);
    }

    @Transactional
    public AssociationLocation update(Long id, AssociationLocation updated) {
        AssociationLocation existing = findById(id);
        existing.setLocationType(updated.getLocationType());
        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setProvince(updated.getProvince());
        existing.setPostalCode(updated.getPostalCode());
        existing.setCountry(updated.getCountry());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setPrimary(updated.isPrimary());
        existing.setNotes(updated.getNotes());
        return locationRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        locationRepository.deleteById(id);
    }
}
