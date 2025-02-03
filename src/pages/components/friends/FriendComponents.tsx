import { memo } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';

interface FriendTypes {
  name: string;
  username: string;
}

interface FriendListProps {
  friends: FriendTypes;
  actionButton: React.ReactNode;
}

function FriendList({ friends, actionButton }: FriendListProps) {
  return (
    <ListGroup.Item className="text-body">
      <Row className="align-items-center justify-content-between">
        <Col>
          <div className="py-2 small w-100">
            <div className="d-flex">
              <strong>{friends.name}</strong>
            </div>
            <span className="text-secondary">@{friends.username}</span>
          </div>
        </Col>
        <Col className="d-flex justify-content-end">
          {actionButton}
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export const ListPlaceholder = memo(() => (
  <>
    {[...Array(3)].map((_, index) => (
      <Placeholder as={Card.Text} animation="glow" className={`pb-4 px-3 ${index === 0 ? 'pt-2' : ''} ${index === 2 ? '' : 'border-bottom'}`} key={index}>
        <Placeholder xs={3} /><br />
        <Placeholder xs={2} />
      </Placeholder>
    ))}
  </>
));

ListPlaceholder.displayName = 'ListPlaceholder';

export default memo(FriendList);