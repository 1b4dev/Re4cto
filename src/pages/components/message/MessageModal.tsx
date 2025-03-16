import { useEffect, useState, useCallback, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import FriendList from '../friends/FriendComponents';
import FormField from '../FormField';
import EmptyComponent from '../EmptyComponent';
import { ActionButton } from '../ActionButton';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';

export interface SearchUsersTypes {
  friend_id: number;
  name: string;
  username: string;
}

interface MessageTypes {
  message_id: number;
  is_deleted: boolean;
  message?: string;
  [key: string]: unknown;
}

interface SearchResponseType {
  friends: SearchUsersTypes[];
}

interface MessageModalProps {
  show: boolean;
  handleClose: () => void;
  handleActive: (id: number) => void;
  handleClick: (id: number) => void;
  handleDeletedActive: (id: number) => void;
  onFriendSelect: (friend: SearchUsersTypes) => void;
}

function MessageModal({ show, handleClose, handleActive, handleClick, handleDeletedActive, onFriendSelect }: MessageModalProps) {
  const { fetchData } = useApi();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<SearchUsersTypes[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const handleLoadFriends = useCallback(async () => {
    if (friends.length > 0) return;
    try {
      const data = await fetchData('friends') as SearchResponseType;
      if (data && Array.isArray(data.friends)) {
        setFriends(data.friends)
      } else {
        throw new Error('No friend data received');
      }
    } catch (error) {
      console.error('Error in handleLoadFriends:', (error as Error).message);
    }
  }, [fetchData, friends.length]);

  useEffect(() => {
    if (show) {
      handleLoadFriends();
    }
  },[show, handleLoadFriends]);

  const filteredFriends = useMemo(() => {
    return friends.filter(friend =>
      friend.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      friend.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [friends, debouncedSearch]);

  const handleFriendSelect = async (friend: SearchUsersTypes) => {
    try {
      const data = await fetchData(`messages/check/${friend.friend_id}`) as MessageTypes;
      if (data.message_id && !data.is_deleted === true) {
        handleClick(data.message_id);
        handleActive(data.message_id);
      } else if (data.is_deleted === true) {
        handleDeletedActive(data.message_id);
        onFriendSelect(friend);
      } else if (data.message) {
        onFriendSelect(friend);
      } else {
        throw new Error('Unable to check if existing message');
      }
      handleClose();
    } catch (error) {
      console.error('Error in handleFriendSelect:', (error as Error).message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" contentClassName="rounded-4 border" tabIndex="-1" aria-labelledby="newMessage" aria-hidden="true" centered>
      <Modal.Header closeButton>
        <h3 className="modal-title" id="messageModalLabel">New message</h3>
      </Modal.Header>
      <Modal.Body>
        <div className="border-bottom pb-2">
          <FormField
            field={{ id: 'search', type: 'search', name: 'search', label: 'Type to search a friend…' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ListGroup variant="flush mb-0 overflow-auto" style={{ maxHeight: '240px' }}>
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendList 
                key={friend.friend_id}
                friends={friend}
                actionButton={
                  <ActionButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleFriendSelect(friend)}
                  >
                    Send
                  </ActionButton>
                }
              />
            ))
          ) : (
            <EmptyComponent
              text="No friends found."
              spacing="mx-4 py-3 my-2"
              textSpacing="mb-2"
            />
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>   
  );
}

export default MessageModal;