import { memo } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import MessageActions from './MessageActions';
import dayjs from '../TimeConfig';

interface GroupTypes {
  sender_id: number;
  text: string;
  sent_at: string;
  text_id: string;
}

interface MessageGroupProps {
  group: GroupTypes[];
  id: number;
}

function MessageGroup({ group, id }: MessageGroupProps){
  const isSender = group[0].sender_id === id;

  return(
    <Row className="mb-3">
      <Col xs={isSender ? {offset: 2} : 10}>
        <div className={`d-flex flex-column ${isSender ? 'align-items-end' : 'align-items-start'}`}>
          {group.map((message) => (
            <div key={message.text_id || `fallback-${message.sent_at}`} className={`d-flex align-items-center gap-2 ${isSender && 'flex-row-reverse'}`}>
              <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word"}} 
                className={`bg-gradient mw-100 p-3 mb-1 rounded-1 
                  ${isSender
                    ? 'bg-body-secondary rounded-top-4 rounded-start-4' 
                    : 'bg-primary text-white rounded-top-4 rounded-end-4'
                  }
                `}
              >
                {message.text}
              </p>
              <MessageActions
                text={message.text}
                textId={message.text_id}
                isSender={isSender}
              />
            </div>
          ))}
          <small className="text-muted">
            {dayjs.utc(group[group.length - 1].sent_at).fromNow()}
          </small>
        </div>
      </Col>
    </Row>
  )
}

export const ListPlaceholder = memo(() => (
  <>
    {[...Array(5)].map((_, index) => (
      <Placeholder 
        key={index}
        as={Card.Text} 
        animation="glow" 
        className={`${index !== 4 ? 'border-bottom' : ''} ${index === 0 ? 'pt-2' : '' } pb-4 px-3`}
      >
        <Placeholder xs={8} /> <Placeholder xs={3} />
        <Placeholder xs={index % 2 === 0 ? (index === 2 ? 9 : 10) : 6} />
        {index % 2 === 0 && <Placeholder xs={4} />}
      </Placeholder>
    ))}
  </>
));

ListPlaceholder.displayName = 'ListPlaceholder';

export default memo(MessageGroup);
