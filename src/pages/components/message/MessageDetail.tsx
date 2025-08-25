import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import dayjs from '../TimeConfig';
import EmptyComponent from '../EmptyComponent';
import MessageGroup from './MessageComponents';
import { ActionButton } from '../ActionButton';
import useApi from '../hooks/useApi';
import useSSE from '../hooks/useSSE';

interface DecodedTokenType {
  user_id: number;
  [key: string]: unknown;
}

interface MessageTypes {
  sender_id: number;
  sent_at: string;
  text: string;
  text_id: string;
  [key: string]: unknown;
}

interface MessageResponseType {
  message_id?: number;
  message?: string;
  active_message?: ActiveMessageTypes;
}

interface ActiveMessageTypes {
  message_id: number;
  sender_id: number;
  sender_name: string;
  sender_username: string;
  receiver_id: number;
  content: string;
  created_at: string;
}

interface ActiveSSETypes {
  active_message: ActiveMessageTypes | null;
}

interface SelectedFriendTypes {
  friend_id: number;
  name: string;
  username: string;
}

interface MessageDetailProps {
  activeMessage: ActiveMessageTypes | null;
  activeDeleted: number | null;
  selectedFriend: SelectedFriendTypes | null;
  onNewMessage: (newMessage: ActiveMessageTypes) => void;
  isMobileDetail: boolean;
  toggleList: () => void;
}
  

function MessageDetail({ activeMessage, activeDeleted, selectedFriend, onNewMessage, isMobileDetail, toggleList }: MessageDetailProps) {
  const [messages, setMessages] = useState<MessageTypes[]>([]);
  const [chat, setChat] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesLengthRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { fetchData } = useApi();
  const isNewChat = selectedFriend && !activeMessage;
  const token = jwtDecode<DecodedTokenType>(localStorage.getItem('token') as string);
  const id = token.user_id;

  const sseEndpoint = activeMessage?.message_id ? `messages/active/stream/${activeMessage.message_id}` : null;
  const { data: sseData } = useSSE<ActiveSSETypes>(sseEndpoint);

  useEffect(() => {
    if (sseData?.active_message) {
      try {
        const parsedContent = JSON.parse(sseData.active_message.content);
        setMessages(parsedContent.messages);
      } catch (error) {
        console.error('Error parsing SSE data: ', error);
      }
    }
  }, [sseData]);

  const adjustTextarea = useCallback (() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  const resetTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setChat('');
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChat(e.target.value);
    adjustTextarea();
  }, [adjustTextarea]);

  useEffect(() => {
    if (activeMessage?.content){
      const parsedContent = JSON.parse(activeMessage.content);
      setMessages(parsedContent.messages);
    }
  }, [activeMessage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (selectedFriend || (messages.length > 0 && messages.length !== messagesLengthRef.current)) {
      scrollToBottom();
      messagesLengthRef.current = messages.length;
    }
  }, [messages, selectedFriend, scrollToBottom]);

  const groupMessages = useMemo(() => {
    return (messages: MessageTypes[]) => messages.reduce((groups: MessageTypes[][], message, index) => {      
      if (index === 0){
        groups.push([message]);
      } else {
        const prevMessages = messages[index - 1];
        const timeDiff = dayjs(message.sent_at).diff(dayjs(prevMessages.sent_at), 'minutes');
        const isSameSender = message.sender_id === prevMessages.sender_id;
        const isSameDay = dayjs(message.sent_at).isSame(dayjs(prevMessages.sent_at), 'day');
  
        if (isSameSender && isSameDay && timeDiff < 5) {
          groups[groups.length - 1].push(message);      
        } else {
          groups.push([message]);      
        }
      }
      return groups;
    }, []);
  }, []);

  const handleReply = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageId = e.currentTarget.id;
    
    if (!chat.trim()) return;

    try {
      const endpoint = selectedFriend && !activeDeleted ? 'messages/create' : 'messages/reply';
      const method = selectedFriend && !activeDeleted ? 'POST' : 'PUT';
      const body = selectedFriend && !activeDeleted
        ? { message: chat, receiver_id: messageId }
        : { reply: chat, message_id: messageId };
      const response = await fetchData(endpoint, method, body) as MessageResponseType;
      if (response?.message_id || response?.message) {
        resetTextarea();
        if (selectedFriend && response?.message_id) {
          const activeMessageId = response?.message_id;
          const data = await fetchData(`messages/active/${activeMessageId}`) as ActiveSSETypes;
          if (data?.active_message) {
            onNewMessage(data.active_message)
          }
        }
      } else {
        console.error('Message reply was not successful');
      }
    } catch (error) {
        console.error('Error in handleReply:', (error as Error).message);
    }
  }, [chat, fetchData, selectedFriend, activeDeleted, onNewMessage, resetTextarea]);
  
  return (
    <Card className="rounded-4" style={{height : '605px'}}>
      <Card.Header className="rounded-top-4">
        <Row className="align-items-center justify-content-between">
          {isMobileDetail && (
            <Col xs={2} className="d-inline-flex">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={toggleList}
              >
                {'\u2190'}
              </ActionButton>
            </Col>
          )}
          <Col className={`${isMobileDetail && 'ps-0'}`}>
            <h3 className={`my-3 ${(isNewChat || !activeMessage?.sender_username) && 'text-muted'}`}>
              {isNewChat 
                ? `New Chat w/${selectedFriend.name}` : activeMessage?.sender_username 
                ? (
                  <div className="d-flex align-items-end justify-content-between"> 
                    {activeMessage.sender_name}
                    <span className="fs-6 fw-normal mb-1 text-muted"> @{activeMessage.sender_username}</span>
                  </div>
                )
                : `No message selected`
              }
            </h3>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="overflow-auto py-0">
        <div className={(!isNewChat && messages.length > 0) ? 'pt-3 position-relative' : 'd-flex align-items-center h-100'}>
          {(!isNewChat && messages.length > 0) ? (
            groupMessages(messages).map((group, groupIndex) => (
              <MessageGroup
                key={groupIndex}
                group={group}
                id={id}
              />
            ))
          ) : (
            <EmptyComponent
              title={isNewChat  
                ? `Start a conversation with @${selectedFriend.username}` 
                : "Select a message"
              }
              text={isNewChat 
                ? "Type your first message below to begin chatting" 
                : "To view a conversation please select a message from list, if there is no message on list you may create a new one from new message button."
              }
              textSpacing={isNewChat ? "mb-2" : ""}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card.Body>
      {(selectedFriend || messages.length > 0) && (
        <Card.Footer className="rounded-bottom-4">
          <Form onSubmit={handleReply} id={String(activeDeleted ? activeDeleted : !activeDeleted && isNewChat ? selectedFriend?.friend_id : activeMessage?.message_id)} method="post">
            <div className="text-muted d-flex justify-content-start align-items-center my-1">
              <div className="position-relative w-100">
                <Form.Control 
                  as="textarea"
                  ref={textareaRef}
                  maxLength={1000} 
                  rows={2} 
                  className="bg-secondary-subtle rounded-3 pb-3" 
                  style={{paddingRight: '4rem'}}
                  placeholder="Message…"
                  aria-label="Reply message field"
                  required 
                  value={chat} 
                  onChange={handleChange}
                />
                <div className="position-absolute end-0 bottom-0 m-2">
                  <ActionButton
                    size="sm"
                    variant="secondary"
                    type="submit"
                    classes="px-2"
                  >
                    Send
                  </ActionButton>
                </div>
              </div>
            </div>
          </Form>
        </Card.Footer>
      )}
    </Card>
  );
}

export default MessageDetail;