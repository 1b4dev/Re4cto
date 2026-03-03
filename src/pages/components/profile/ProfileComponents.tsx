export const initialFormDataState = {
  name: '',
  username: '',
  email: ''
}

export const initialAlertState = {
  show: false, 
  variant: '', 
  message: ''
}

export const formFields = [
  { id: 'name', type: 'text', name: 'name', label: 'Name' },
  { id: 'username', type: 'text', name: 'username', label: 'Username' },
  { id: 'email', type: 'email', name: 'email', label: 'Email' }
];