import { useState, useEffect, useCallback, useMemo } from 'react';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import dayjs from './components/TimeConfig';
import ProfileCard from './components/profile/ProfileComponents';
import ProfileModal from './components/profile/ProfileModal';
import { ActionButton } from './components/ActionButton';
import useApi from './components/hooks/useApi';

interface UserTypes {
  name: string;
  username: string;
  email: string;
  last_login: string | null;
}

interface ProfileFieldTypes {
  label: string;
  value: string | undefined;
  isFirst?: boolean;
}

interface ProfileProps {
  updateUser: (user: UserTypes) => void;
}

function Profile({ updateUser }: ProfileProps) {
  const [user, setUser] = useState<UserTypes | null>(null);
  const [show, setShow] = useState(false);
  const { fetchData, loading } = useApi(true);

  useEffect(() => {
    const handleUser = async () => {
      try {
        const data = await fetchData('profile'); 
        if (data) {
          setUser(data.user);
        } else {
          throw new Error('No data received');
        }
      } catch (error: any) {
        console.error('Error in handleUser:', error.message); 
      }
    };  
    handleUser();
  }, [fetchData]);

  const handleUpdateUser = useCallback((updatedUser: UserTypes) => {
    setUser(updatedUser);
    updateUser(updatedUser);
  }, [updateUser]);

  const profileFields = useMemo<ProfileFieldTypes[]>(() => 
    [
      { label: "Name", value: user?.name, isFirst: true },
      { label: "Username", value: user?.username },
      { label: "Email", value: user?.email },
      { label: "Last Login Time", value: user?.last_login ? dayjs.utc(user.last_login).fromNow() : "Never logged in" }
    ],
    [user]
  );

  return (
    <>
      <Card className="rounded-4">
        <Card.Header className="rounded-top-4">
          <h3 className="mt-4 mb-3">Profile Information</h3>
        </Card.Header>
        <Card.Body className="pt-4">
          {profileFields.map(({ label, value, isFirst }, index) =>
            <ProfileCard              
              key={`profile-field-${index}`}
              label={label}
              value={value}
              isFirst={isFirst}
              loading={loading}
            />
          )}
        </Card.Body>
        <Card.Footer className="rounded-bottom-4">
          <Col className="my-2">
            <ActionButton
              variant="primary"
              onClick={() => setShow(true)}
              disabled={loading}
            >
              Edit Profile
            </ActionButton>
          </Col>
        </Card.Footer>
      </Card>
      <ProfileModal
        show={show}
        onHide={() => setShow(false)}
        user={user}
        updateUser={handleUpdateUser}
      />
    </>
  );
}

export default Profile;