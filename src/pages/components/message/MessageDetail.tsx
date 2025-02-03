import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { jwtDecode } from 'jwt-decode';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import dayjs from '../TimeConfig';
import EmptyComponent from "../EmptyComponent";
import MessageGroup from "./MessageComponents";
import { ActionButton } from "../ActionButton";
import useApi from "../useApi";
import usePoll from "../usePoll";

interface DecodedTokenType {
  user_id: number;
  [key: string]: any;
}

interface MessageTypes {
  sender_id: number;
  sent_at: string;
  text: string;
  [key: string]: any;
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

interface SelectedFriendTypes {
  friend_id: number;
  name: string;
  username: string;
}

interface MessageDetailProps {
  activeMessage: ActiveMessageTypes | null;
  selectedFriend: SelectedFriendTypes | null;
  onNewMessage: (newMessage: ActiveMessageTypes) => void;
  isMobileDetail: boolean;
  toggleList: () => void;
}
  

function MessageDetail({ activeMessage, selectedFriend, onNewMessage, isMobileDetail, toggleList }: MessageDetailProps) {
  const [messages, setMessages] = useState<MessageTypes[]>([]);
  const [chat, setChat] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesLengthRef = useRef<number>(0);

  const { fetchData } = useApi();
  const isNewChat = selectedFriend && !activeMessage;
  const token = jwtDecode<DecodedTokenType>(localStorage.getItem('token') as string);
  const id = token.user_id;

  const pollMessage = useCallback (async (signal: AbortSignal) => {
    if (!activeMessage?.message_id) return;      
    try {
      const data = await fetchData(`messages/active/${activeMessage.message_id}`, 'GET', null, {}, true, { signal });
      if (signal.aborted) return;
      if (data?.active_message) {
        const parsedContent = JSON.parse(data.active_message.content);
        if (parsedContent.messages.length !== messages.length) {
          setMessages(parsedContent.messages);
        }
      } else {
        throw new Error('Error in processing API call');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error in pollMessage:', error);
      }
    }
  }, [activeMessage?.message_id, fetchData]);

  usePoll(pollMessage, 6000, [activeMessage?.message_id]);

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
  }, [messages, selectedFriend]);

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
      const endpoint = selectedFriend ? 'messages/create' : 'messages/reply';
      const method = selectedFriend ? 'POST' : 'PUT';
      const body = selectedFriend
        ? { message: chat, receiver_id: messageId }
        : { reply: chat, message_id: messageId };
      const response = await fetchData(endpoint, method, body);
      if (response?.message_id || response?.message) {
        const activeMessageId = response?.message_id || messageId
        const data = await fetchData(`messages/active/${activeMessageId}`);
        if (data?.active_message) {
          if (selectedFriend) {
            onNewMessage(data.active_message)
          }
          const parsedContent = JSON.parse(data.active_message.content);
          setMessages(parsedContent.messages);
          setChat('');
        } else {
          console.error('Error fetching chat messages after reply');
        }
      } else {
        console.error('Message reply was not successful');
      }
    } catch (error) {
        console.error('Error in handleReply:', (error as Error).message);
    }
  }, [chat, fetchData, selectedFriend, onNewMessage]);
  
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
                &larr; 
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
          <Form onSubmit={handleReply} id={String(isNewChat ? selectedFriend?.friend_id : activeMessage?.message_id)} method="post">
            <div className="text-muted d-flex justify-content-start align-items-center my-1">
              <Form.Control 
                as="textarea" 
                maxLength={1000} 
                rows={1} 
                className="bg-secondary-subtle me-2" 
                placeholder="Message…"
                aria-label="Reply message field"
                required 
                value={chat} 
                onChange={(e:React.ChangeEvent<HTMLTextAreaElement>) => setChat(e.target.value)}
              />
              <ActionButton
                variant="secondary"
                type="submit"
                classes="px-3"
              >
                Send
              </ActionButton>
            </div>
          </Form>
        </Card.Footer>
      )}
    </Card>
  );
}

export default MessageDetail;