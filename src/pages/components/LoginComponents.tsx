export const initialLoginState = {
    username: '',
    password: ''
};

export const initialAlertState = {
    show: false,
    message: '',
    variant: ''
};

export const formFields = [
    { id: 'username', type: 'text', name: 'username', label: 'Email or Username' },
    { id: 'password', type: 'password', name: 'password', label: 'Password' }
] as const satisfies ReadonlyArray<{ 
    id: string;
    name: string;
    label: string;
    type: string;
}>;
