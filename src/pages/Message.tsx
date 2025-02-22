import { useState, useCallback } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Fade from 'react-bootstrap/Fade';
import MessageList from './components/message/MessageList';
import MessageDetail from './components/message/MessageDetail';
import MessageModal, { SearchUsersTypes } from './components/message/MessageModal';
import { ActionButton } from './components/ActionButton';
import useApi from './components/hooks/useApi';
import usePoll from './components/hooks/usePoll';

interface MessageListTypes {
  message_id: number;
  sender_username: string;
  latest_message: string;
  sent_at: string;
  status_count: number;
}

interface MessageActiveTypes {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  sender_username: string;
  content: string;
  created_at: string;
}

function Message() {
  
  const [show, setShow] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<MessageListTypes[]>([]);
  const [activeMessage, setActiveMessage] = useState<MessageActiveTypes | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<SearchUsersTypes | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [isMobileDetail, setIsMobileDetail] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const { fetchData, loading } = useApi();

  const modalClose = () => setShow(false);
  const modalShow = () => setShow(true);

  const handleActive = (messageId: number) => {
    setActive(messageId);
  };

  const handleSelectFriend = (friend: SearchUsersTypes) => {
    setActive(null);
    setActiveMessage(null);
    setSelectedFriend(friend);
    (() => window.innerWidth < 576 && setIsMobileDetail(true))();    
    modalClose();
  };

  const handleNewMessage = async (newMessage: MessageActiveTypes) => {
    setActiveMessage(newMessage);
    setSelectedFriend(null);
    setActive(newMessage.message_id);
    await handleMessageList();
  }

  const handleDeleteMessage = async () => {
    setActive(null);
    setActiveMessage(null);
    await handleMessageList();
  };

  const handleToggleList = () => {
    setIsMobileDetail(false);
    setActive(null);
    setActiveMessage(null);
    setSelectedFriend(null);
  }

  const handleClick = useCallback(async (id: number) => {
    try {
      const data = await fetchData(`messages/active/${id}`);  
      if (data.active_message) {
        setActiveMessage(data.active_message);
        const readMessage = await fetchData(`messages/active/read`, 'PUT', {message_id:id});
        if(!readMessage){
          throw new Error('Error set messages as read');
        }
        (() => window.innerWidth < 576 && setIsMobileDetail(true))();      
      } else {
        throw new Error('Error fetching data');
      }
    } catch (error) {
      console.error('Error in handleClick:', (error as Error).message);
    }
  }, [fetchData]);
  
  const handleMessageList = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchData('messages', 'GET', null, {}, true, { signal })    
      if (data && Array.isArray(data.messages)) {
        setMessageList(data.messages);
        setFirstLoad(false);
      } else {
        throw new Error('Error in processing API call');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError'){
        console.error('Error in handleMessageList:', (error as Error).message);
      }
    }
  }, [fetchData]);

  usePoll(handleMessageList, 10000, [true]);

  return (
    <section className="mb-3">
      <Row className="mb-2">
        <Col sm={5} lg={4} xxl={3} className={`mb-md-0 pe-sm-2 mb-2 ${isMobileDetail ? 'd-none d-sm-block' : ''}`}>
          <Fade in={!isMobileDetail}>
            <div>
              <Card className="rounded-4" style={{height : '605px'}}>
                <Card.Header className="rounded-top-4">
                  <Row className="align-items-center justify-content-between">
                    <Col>
                      <h3 className="my-3">Messages</h3>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <ActionButton
                        variant="secondary"
                        size="sm"
                        onClick={modalShow}
                      >
                        New Message
                      </ActionButton>
                    </Col>
                  </Row>
                  <MessageModal 
                    show={show} 
                    handleClose={modalClose} 
                    handleActive={handleActive}
                    handleClick={handleClick}
                    onFriendSelect={handleSelectFriend}
                  />
                </Card.Header>
                <MessageList 
                  messageList={messageList}
                  loading={firstLoad ? loading : false} 
                  handleClick={handleClick} 
                  handleActive={handleActive} 
                  active={active}
                  onDeleted={handleDeleteMessage} 
                />
              </Card>
            </div>
          </Fade>
        </Col>
        <Col sm={7} lg={8} xxl={9} className={`ps-sm-0 ${(!activeMessage && !selectedFriend) && "d-none d-sm-block"}`}>
          <MessageDetail 
            activeMessage={activeMessage}
            selectedFriend={selectedFriend}
            onNewMessage={handleNewMessage}
            isMobileDetail={isMobileDetail}
            toggleList={handleToggleList}
          />
        </Col>
      </Row>
    </section>
  );
}

export default Message;