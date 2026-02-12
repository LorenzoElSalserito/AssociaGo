package com.associago.finance;

import com.associago.finance.repository.PaymentMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }

    public List<PaymentMethod> getAllByAssociation(Long associationId) {
        return paymentMethodRepository.findByAssociationId(associationId);
    }

    public List<PaymentMethod> getActiveByAssociation(Long associationId) {
        return paymentMethodRepository.findByAssociationIdAndIsActiveTrue(associationId);
    }

    public PaymentMethod getById(Long id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));
    }

    @Transactional
    public PaymentMethod create(PaymentMethod paymentMethod) {
        return paymentMethodRepository.save(paymentMethod);
    }

    @Transactional
    public PaymentMethod update(Long id, PaymentMethod updatedMethod) {
        PaymentMethod existing = getById(id);
        
        existing.setName(updatedMethod.getName());
        existing.setType(updatedMethod.getType());
        existing.setActive(updatedMethod.isActive());
        existing.setHasCommission(updatedMethod.isHasCommission());
        existing.setFixedCommission(updatedMethod.getFixedCommission());
        existing.setPercentageCommission(updatedMethod.getPercentageCommission());
        existing.setConfiguration(updatedMethod.getConfiguration());
        
        return paymentMethodRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        paymentMethodRepository.deleteById(id);
    }
}
