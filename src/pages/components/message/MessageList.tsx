import { useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import dayjs from '../TimeConfig';
import SwipeableListItem from './MessageItemSwipe';
import ConfirmModal from '../ConfirmModal';
import EmptyComponent from '../EmptyComponent';
import { ListPlaceholder } from './MessageComponents';
import useApi from '../hooks/useApi';

interface MessageTypes {
  message_id: number;
  sender_username: string;
  latest_message: string;
  sent_at: string;
  status_count: number;
}

interface MessageListProps {
  messageList: MessageTypes[];
  loading: boolean;
  handleClick: (id: number) => void;
  handleActive: (id: number) => void;
  active: number | null;
  onDeleted: () => void;
}

function MessageList({ messageList, loading, handleClick, handleActive, active, onDeleted }: MessageListProps) {
  const { fetchData } = useApi();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = useCallback(async () => {
    setDeleting(confirmDelete)
    try {
      await fetchData('messages/delete', 'PUT', {
        messageId: confirmDelete
      })
      onDeleted();
    } catch (error) {
      console.error('Error in handleDelete:', (error as Error).message); 
    } finally {
      setDeleting(null);
      setShowModal(false);
    }
  }, [confirmDelete, fetchData, onDeleted]);

  const openConfirmModal = useCallback((id: number) => {
    setConfirmDelete(id);
    setShowModal(true);
  }, []);

  const handleItemClick = useCallback((id: number) => {
    handleClick(id);
    handleActive(id);
  }, [handleClick, handleActive]);

  const truncateMessage = useCallback((message: string) => {
    if (!message) return '…';
    return message.length > 50 ? `${message.substring(0, 50)}…` : message;
  }, []);

  return (
    <Card.Body className={messageList.length === 0 || loading ? 'pt-2' : 'overflow-auto py-0'}>
      <div className={messageList.length > 0 || loading ? 'position-relative' : 'd-flex align-items-center h-100'}>
        <ListGroup variant="flush">
          {loading ? (
            <ListPlaceholder />
          ) : messageList.length > 0 ? (
            messageList.map((list) => (
              <ListGroup.Item key={list.message_id} className="px-0">
                <SwipeableListItem
                  onDelete={() => openConfirmModal(list.message_id)}
                  onClick={() => {handleItemClick(list.message_id)}} 
                >
                  <a
                    onClick={() => {handleItemClick(list.message_id)}} 
                    className={`list-group-item list-group-item-action border-0 rounded-4 ${list.status_count > 0 ? 'fw-bold' : ""} ${active === list.message_id ? 'active' : ""}`} 
                    aria-current="true"
                    aria-label={`Open existing conversation with ${list.sender_username}`}
                  >
                    <Row>
                      <div className="fw-normal opacity-75 d-flex w-100 align-items-center justify-content-between mt-1">
                        <h5 className="fw-normal fs-6 mb-0">@{list.sender_username}</h5>
                        <small>{dayjs.utc(list.sent_at).fromNow()}</small>
                      </div>
                    </Row>
                    <Row>
                      <Col>
                        <p className="my-1">
                          {truncateMessage(list.latest_message)}
                        </p>
                      </Col>
                      {list.status_count > 0 && (
                        <Col xs={2}>
                          <span className="badge bg-danger float-end mt-2 rounded-pill">{list.status_count}</span>
                        </Col>
                      )}
                    </Row>
                  </a>
                </SwipeableListItem>
              </ListGroup.Item>
            ))
          ) : (
            <EmptyComponent
              title="No messages available"
              text="To start a conversation, you may use new message button to create one."
              spacing="mx-3"
              textSpacing="mb-4"
            />
          )}
        </ListGroup>
        <ConfirmModal
          show={showModal}
          title="Delete Message"
          message="Are you sure you want to delete this message? Deleted messages will be completetely gone."
          onHide={() => setShowModal(false)}
          onConfirm={handleDelete}
          isDeleting={deleting !== null}
        />
      </div>
    </Card.Body>
  );
}

export default MessageList;