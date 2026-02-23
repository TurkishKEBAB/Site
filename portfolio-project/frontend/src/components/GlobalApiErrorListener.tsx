import { useEffect } from 'react';

import { useToast } from './Toast';

interface ApiErrorEventDetail {
  status?: number;
}

export const statusToMessage = (status?: number) => {
  if (status === 401 || status === 403) {
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 404) {
    return 'Requested resource was not found.';
  }
  if (status === 500) {
    return 'Server error occurred. Please try again later.';
  }
  return 'Request failed. Please try again.';
};

export default function GlobalApiErrorListener() {
  const { showToast } = useToast();

  useEffect(() => {
    const handler = (event: Event) => {
      if (window.location.pathname.startsWith('/admin')) {
        return;
      }

      const customEvent = event as CustomEvent<ApiErrorEventDetail>;
      const status = customEvent.detail?.status;

      if (!status || (status !== 404 && status !== 500)) {
        return;
      }

      showToast('error', statusToMessage(status));
    };

    window.addEventListener('api:error', handler);
    return () => window.removeEventListener('api:error', handler);
  }, [showToast]);

  return null;
}
