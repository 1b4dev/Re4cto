import { useCallback, useState } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import FriendList from './FriendComponents';
import ConfirmModal from '../ConfirmModal';
import EmptyComponent from '../EmptyComponent';
import { ActionButton } from '../ActionButton';
import { ListPlaceholder } from './FriendComponents';
import useApi from '../hooks/useApi';

interface FriendTypes {
  friend_id: number;
  name: string;
  username: string;
}

interface FriendsAcceptedProps {
  friends: FriendTypes[];
  loading: boolean;
  onDeleted: () => void;
}

function FriendsAccepted ({ friends, loading, onDeleted }: FriendsAcceptedProps) {
  const { fetchData } = useApi();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = useCallback(async () => {
    if(!confirmDelete) return;
    setDeleting(confirmDelete)
    try{
      await fetchData ('friends/delete', 'DELETE', {
        friendId: confirmDelete
      })
      onDeleted()
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(null);
      setShowModal(false);
      setConfirmDelete(null);
    }
  }, [confirmDelete, fetchData, onDeleted]);

  const openConfirmModal = useCallback((id: number) => {
    setConfirmDelete(id);
    setShowModal(true);
  }, []);

  return (
    <>
      <Card.Title className="fs-6 text-muted pt-2 pb-3 border-bottom">Your Existing Friends</Card.Title>
        <ListGroup variant="flush">
          {loading ? (
            <ListPlaceholder />
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <FriendList 
                key={friend.friend_id} 
                friends={friend}
                actionButton={
                  <ActionButton
                    variant="danger"
                    size="sm"
                    isLoading={deleting === friend.friend_id}
                    onClick={() => openConfirmModal(friend.friend_id)}
                    disabled={deleting === friend.friend_id}
                    aria-label={`Delete ${friend.name} from friends`}
                  >
                    Delete
                  </ActionButton>
                }
              />
            ))
          ) : (
            <EmptyComponent
              title="No friends available"
              text="To find and add your friends, you may use add friend button."
              spacing="mx-3 py-4 my-3"
              titleSpacing="fs-6 pt-3"
              textSpacing="mb-2 small"
            />
          )
        }
      </ListGroup>
      <ConfirmModal
        show={showModal}
        title="Delete Friend"
        message="Are you sure you want to delete this friend?"
        onHide={() => setShowModal(false)}
        onConfirm={handleDelete}
        isDeleting={deleting === confirmDelete} 
      />
    </>
  )
}

export default FriendsAccepted;