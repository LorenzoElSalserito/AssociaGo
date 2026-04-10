package com.associago.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationRecipientRepository extends JpaRepository<CommunicationRecipient, Long> {
    List<CommunicationRecipient> findByCommunicationId(Long communicationId);
}
