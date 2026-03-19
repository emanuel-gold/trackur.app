import { useState, useCallback } from 'react';

export default function useInlineEdit() {
  const [editingField, setEditingField] = useState(null);
  const [draftValue, setDraftValue] = useState('');

  const startEdit = useCallback((fieldName, currentValue) => {
    setEditingField(fieldName);
    setDraftValue(currentValue ?? '');
  }, []);

  const updateDraft = useCallback((value) => {
    setDraftValue(value);
  }, []);

  const cancel = useCallback(() => {
    setEditingField(null);
    setDraftValue('');
  }, []);

  const save = useCallback(() => {
    const result = { field: editingField, value: draftValue };
    setEditingField(null);
    setDraftValue('');
    return result;
  }, [editingField, draftValue]);

  return { editingField, draftValue, startEdit, updateDraft, cancel, save };
}
