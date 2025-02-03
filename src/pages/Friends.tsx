import { useState, useEffect, useCallback } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import FriendsModal from './components/friends/FriendsModal';
import FriendsAccepted from './components/friends/FriendsAccepted';
import FriendsPending from './components/friends/FriendsPending';
import { ActionButton } from './components/ActionButton';
import useApi from './components/useApi';

interface FriendTypes {
  friend_id: number;
  name: string;
  username: string;
}

interface RequestTypes {
  requester_id: number;
  name: string;
  username: string;
}

function Friends() {
  const [show, setShow] = useState(false)
  const [friends, setFriends] = useState<FriendTypes[]>([]);
  const [requests, setRequests] = useState<RequestTypes[]>([]);
  const { fetchData, loading } = useApi(true);

  const handleFriendList = useCallback(async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        fetchData('friends'),
        fetchData('friends/pending')
      ]);
      if (friendsData && Array.isArray(friendsData.friends)) {
        setFriends(friendsData.friends);
      }
      if (requestsData && Array.isArray(requestsData.requests)) {
        setRequests(requestsData.requests);
      }
      if (!friendsData || !requestsData) {
        throw new Error('No data received');
      }
    } catch (error) {
      console.error('Error in handleFriendList:', (error as Error).message);
    }
  }, [fetchData]);

  useEffect(() => {
    handleFriendList();
  }, [handleFriendList]);

  return (
    <>
      <Card className="rounded-4">
        <Card.Header className="rounded-top-4">
          <Row className="align-items-center justify-content-between">
            <Col>
              <h3 className="my-3">Friend List</h3>
            </Col>
            <Col className="d-flex justify-content-end">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setShow(true)}
              >
                Add Friend
              </ActionButton>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <FriendsPending 
            requests={requests}
            onRequest={() => handleFriendList()}
          />
          <FriendsAccepted 
            friends={friends}
            loading={loading}
            onDeleted={() => handleFriendList()}
          />
        </Card.Body>
      </Card>
      <FriendsModal
        show={show}
        onHide={() => setShow(false)}
      />
    </>
  );
}

export default Friends;