import { useRef, useState, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import ConfirmModal from '../ConfirmModal';
import useApi from '../hooks/useApi';

interface MessageActionsProps {
  text: string;
  textId: string;
  isSender: boolean;
}

function MessageActions({ text, textId, isSender }: MessageActionsProps){
  const { fetchData } = useApi();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const copyTarget = useRef<HTMLAnchorElement | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowOverlay(true);
      setTimeout(() => {
        setShowOverlay(false)
        setActiveIndex(null);
      }, 1000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [text]);

  const openConfirmModal = useCallback((id: string) => {
    setConfirmDelete(id);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if(!confirmDelete) return;
    setDeleting(confirmDelete)
    try{
      await fetchData ('messages/active/delete', 'DELETE', {
        textId: confirmDelete
      })
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(null);
      setShowModal(false);
      setConfirmDelete(null);
    }
  }, [confirmDelete, fetchData]);

  return (
    <>
      <Dropdown
        show={activeIndex === textId}
        onToggle={(isOpen: boolean) => setActiveIndex(isOpen ? textId : null)}
        autoClose="outside"
      >
        <Dropdown.Toggle
          size="lg"
          className="text-body px-1 fs-6 fw-bolder bg-transparent border-0 dropdown-caret"
        >
          {'\u22EE'}
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="bg-body-tertiary rounded-3 shadow-sm p-2"
          align={isSender ? 'end' : 'start'}
        >
          <Dropdown.Item
            className="px-2 rounded-2"
            onClick={handleCopy}
            ref={copyTarget}
          >
            Copy
          </Dropdown.Item>
          <Dropdown.Item 
            className="px-2 rounded-2 text-danger"
            onClick={() => openConfirmModal(textId)}
          >
            Delete
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Overlay
        target={copyTarget.current ?? null}
        show={showOverlay}
        placement="top"
      >
        {(props) => (
          <Tooltip {...props} className="fade">
            Copied!
          </Tooltip>
        )}
      </Overlay>
      <ConfirmModal
        show={showModal}
        title="Delete Message"
        message="Are you sure you want to delete this message?"
        onHide={() => setShowModal(false)}
        onConfirm={handleDelete}
        isDeleting={deleting === confirmDelete} 
        />
    </>
  );
};

export default MessageActions;