import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import useApi from '../useApi';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import FormField from '../FormField';
import { ActionButton } from '../ActionButton';
import AlertProvider from '../AlertProvider';
import { initialFormDataState, initialAlertState, formFields } from './ProfileComponents';

interface AlertTypes {
  show: boolean; 
  message: string; 
  variant: string;
}

interface UserTypes {
  name: string;
  username: string;
  email: string;
  last_login: string | null;
}

interface ProfileModalProps {
  show: boolean;
  onHide: () => void;
  user: UserTypes | null;
  updateUser: (user: UserTypes) => void;
}

function ProfileModal({ show, onHide, user, updateUser }: ProfileModalProps) {
  const [formData, setFormData] = useState<Partial<UserTypes>>(initialFormDataState);
  const [alert, setAlert] = useState<AlertTypes>(initialAlertState);
  const timeoutRef = useRef<number | null>(null);
  const { fetchData, loading } = useApi();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email
      });
    }
  }, [user]);

  const hasChanged = useMemo(() => {
    if(!user) return false;
      return Object.keys(formData).some(key => formData[key as keyof UserTypes] !== user[key as keyof UserTypes]);
  }, [formData, user]);

  const showAlert = useCallback((message: string, variant: string = 'danger') => {
    setAlert({
      show: true,
      message,
      variant
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
  }, []);

  const handleSaveChanges = useCallback(async (formData: Partial<UserTypes>) => {
    const controller = new AbortController();
    try {
      if (!hasChanged) {
        showAlert('You need to make changes for submit', 'warning');
        return;
      }
      const data = await fetchData('profile/update', 'PUT', formData, {}, true, { signal: controller.signal });
      if (data.token) {
        localStorage.setItem('token', data.token);
        showAlert(data.message || 'Profile updated successfully on frontend', 'success');
        updateUser({...user, ...formData} as UserTypes)
        timeoutRef.current = setTimeout(() => {
          onHide();
          setAlert(initialAlertState);
        }, 2000);
      } else {
        showAlert(data.error || 'An error occurred while updating the profile on frontend');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('Error in handleSaveChanges:', (error as Error).message);
      showAlert((error as Error).message || 'An error occurred while updating the profile on frontend');
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      controller.abort();
    }
  }, [fetchData, hasChanged, showAlert, onHide, user, updateUser]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSaveChanges(formData);
  }, [handleSaveChanges, formData]);

  const handleChange = useCallback((field: keyof UserTypes) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value.trim()
    }));
  }, []);

  return (
    <Modal show={show} onHide={onHide} backdrop="static" contentClassName="rounded-4 border" aria-labelledby="modal-title" centered>
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} id="update">
          <AlertProvider alert={alert} onClose={hideAlert} />
          {formFields.map(field => (
            <FormField 
              key={field.id}
              field={field}
              value={formData[field.id as keyof UserTypes] || ''}
              onChange={handleChange(field.id as keyof UserTypes)}
            />
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <ActionButton
          variant="primary"
          type="submit"
          form="update"
          classes="w-25"
          isLoading={loading}
          disabled={loading || !hasChanged}
        >
          Save
        </ActionButton>
      </Modal.Footer>
    </Modal>
  );
}

export default memo(ProfileModal);