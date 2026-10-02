import { useState } from 'react';

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const confirm = (message, onConfirm, title = 'Konfirmasi') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const handleConfirm = () => {
    if (confirmState.onConfirm) confirmState.onConfirm();
    setConfirmState((s) => ({ ...s, isOpen: false }));
  };

  const handleCancel = () => {
    setConfirmState((s) => ({ ...s, isOpen: false }));
  };

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
  };
}
