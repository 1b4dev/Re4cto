import { useState, useEffect, useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import FriendList from './FriendComponents';
import { ActionButton } from '../ActionButton';
import FormField from '../FormField';
import EmptyComponent from '../EmptyComponent';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce'

interface SearchUsersTypes {
  id: number;
  name: string;
  username: string;
}

interface FriendsModalProps {
  show: boolean;
  onHide: () => void;
}

function FriendsModal({ show, onHide }: FriendsModalProps) {
  const { fetchData } = useApi();
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchUsers, setSearchUsers] = useState<SearchUsersTypes[]>([]);
  const [adding, setAdding] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [addedUsers, setAddedUsers] = useState(new Set<number>());
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const controller = new AbortController();
    const handleSearchData = async () => {
      if (debouncedSearch) {
        setHasSearched(true);
        setSearchLoading(true);
        try {
          const response = await fetchData(`friends/search?q=${encodeURIComponent(debouncedSearch)}`, 'GET', null, {}, true, { signal: controller.signal });
          if (response) {
            setSearchUsers(response.results);
          } else {
            throw new Error('No data received');
          }
        } catch (error) {
          console.error('Error in handleSearchData:', (error as Error).message); 
          if ((error as Error).name !== 'AbortError'){
            setSearchUsers([]);
          }
        } finally {
          if (!controller.signal.aborted){
            setSearchLoading(false);
          }
        }
      } else {
        setSearchUsers([]);
        setHasSearched(false);
      }
    }
    handleSearchData();
    return () => controller.abort();
  }, [debouncedSearch, fetchData]);

  const handleAdd = useCallback(async (id: number) => {
    setAdding(id)
    try{
      await fetchData ('friends/add', 'POST', {
        friendId: id
      })
      setAddedUsers((prev => new Set(prev).add(id)))
    } catch (error) {
      console.log(error);
    } finally {
      setAdding(null)
    }
  }, [fetchData]);

  useEffect(() => {
    if (!show) {
      setSearch('');
      setSearchUsers([]);
      setHasSearched(false);
      setSearchLoading(false);
      setAddedUsers(new Set());
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} backdrop="static" contentClassName="rounded-4 border" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add a Friend</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="border-bottom pb-2">
          <FormField
            field={{ id: 'search', type: 'search', name: 'search', label: 'Type to search…' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ListGroup variant="flush mb-0">
          {searchLoading ? (
            <div className="d-flex flex-column flex-fill text-center py-3 my-2">
              <Spinner className="align-self-center" animation="border" variant="secondary"/>
            </div>
          ) : searchUsers.length > 0 ? (
            searchUsers.map((searchUser: SearchUsersTypes) => (
              <FriendList 
                key={searchUser.id}
                friends={searchUser}
                actionButton={
                  <ActionButton
                    variant="primary"
                    size="sm"
                    isLoading={adding === searchUser.id}
                    disabled={addedUsers.has(searchUser.id) || adding === searchUser.id}
                    onClick={() => handleAdd(searchUser.id)}
                  >
                    {addedUsers.has(searchUser.id) ? 'Added' : 'Add as Friend'}
                  </ActionButton>
                }
              />
            ))
          ) : (
            <EmptyComponent
              text={hasSearched 
                ? "No users found." 
                : "To view users, please use search field above."
              }
              spacing="mx-4 py-3 my-2"
              textSpacing="mb-2"
            />
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}

export default FriendsModal;