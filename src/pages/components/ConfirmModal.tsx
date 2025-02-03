import { memo } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ActionButton } from './ActionButton';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onHide: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  confirmButton?: string;
}

function ConfirmModal({ show, title, message, onHide, onConfirm, isDeleting, confirmButton = 'Delete' }: ConfirmModalProps) {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" contentClassName="rounded-4 border" centered>
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title className="fs-5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-0">
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer className="flex-column align-items-stretch pb-3 border-top-0">
        <ActionButton
          variant="danger"          
          disabled={isDeleting}
          isLoading={isDeleting}
          onClick={onConfirm}
        >
          {confirmButton}
        </ActionButton>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmModal.displayName = 'ConfirmModal';

export default memo(ConfirmModal);