import { memo } from 'react';
import Form from 'react-bootstrap/Form';

interface FieldTypes {
  id: string;
  type: string;
  name: string;
  label: string;
}

interface FormFieldProps {
  field: FieldTypes;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
}

const FormField = ({ field, value, onChange, isInvalid }: FormFieldProps) => (
    <Form.Floating className="mb-2">
        <Form.Control
            id={field.id}
            type={field.type}
            value={value}
            name={field.name}
            className="bg-body-tertiary"
            onChange={onChange}
            aria-label={field.label}
            placeholder={field.label}
            isInvalid={isInvalid}
            required
        />
        <Form.Label className="text-muted" htmlFor={field.id}>{field.label}</Form.Label>
    </Form.Floating>
);

FormField.displayName = 'FormField'

export default memo(FormField);