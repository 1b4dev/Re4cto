import { useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import FriendList from './FriendComponents';
import { ActionButton } from '../ActionButton';
import useApi from '../useApi';

interface RequestTypes {
  requester_id: number;
  name: string;
  username: string;
}

interface requestStatusTypes {
  accepting: number | null;
  deleting: number | null;
}

interface FriendsPendingProps {
  requests: RequestTypes[];
  onRequest?: () => void;
}

function FriendsPending({ requests, onRequest }: FriendsPendingProps) {
  const { fetchData } = useApi();
  const [requestStatus, setRequestStatus] = useState<requestStatusTypes>({ accepting: null, deleting: null });

  const handleRequest = useCallback(async (id:number, action: 'accept' | 'delete') => {
    setRequestStatus(prev => ({ ...prev, [action]: id }))
    try {
      await fetchData(`friends/${action}`, 'PUT', {
        friendId: id,
      })
      onRequest?.();
    } catch (error) {
      console.log(error);
    } finally {
      setRequestStatus(prev => ({ ...prev, [action]: null }))
    }
  }, [fetchData, onRequest]);

  if (!requests.length) return null;

  return (
    <>
      <Card.Title className="fs-6 text-muted pt-2 pb-3 border-bottom">Pending Friend Requests</Card.Title>
      <ListGroup variant="flush border-bottom mb-3">
        {requests.map((request) => (
          <FriendList
            key={request.requester_id}
            friends={request}
            actionButton={
              <>
                <ActionButton
                  variant="success"
                  classes="me-1"
                  size="sm"
                  isLoading={requestStatus.accepting === request.requester_id}
                  onClick={() => handleRequest(request.requester_id, 'accept')}
                  disabled={requestStatus.accepting === request.requester_id}
                >
                  Accept
                </ActionButton>
                <ActionButton
                  variant="danger"
                  size="sm"
                  isLoading={requestStatus.deleting === request.requester_id}
                  onClick={() => handleRequest(request.requester_id, 'delete')}
                  disabled={requestStatus.deleting === request.requester_id}
                >
                  Reject
                </ActionButton>
              </>
            }
          />
        ))}
      </ListGroup>
    </>
  )
}

export default FriendsPending;