import { Alert, AlertTitle, AlertDescription, AlertActions } from './catalyst';
import { Button } from './catalyst';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <Alert open={open} onClose={onCancel} size="sm">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <AlertActions>
        <Button plain onClick={onCancel}>Cancel</Button>
        <Button color="red" onClick={onConfirm}>{confirmLabel}</Button>
      </AlertActions>
    </Alert>
  );
}
