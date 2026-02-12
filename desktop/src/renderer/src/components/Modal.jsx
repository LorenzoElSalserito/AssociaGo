import React from 'react';
import { Modal as BsModal } from 'react-bootstrap';

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
  return (
    <BsModal show={isOpen} onHide={onClose} size={size} centered>
      <BsModal.Header closeButton>
        <BsModal.Title>{title}</BsModal.Title>
      </BsModal.Header>
      <BsModal.Body>
        {children}
      </BsModal.Body>
    </BsModal>
  );
};

export default Modal;
