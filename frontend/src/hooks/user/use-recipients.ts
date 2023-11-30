import { useQuery } from '@tanstack/react-query';
import { axios } from '../../services/axios';
import { useMemo } from 'react';

export function useRecipients() {
  const { isLoading, error, data, isSuccess } = useQuery({
    queryKey: ['recipients'],
    queryFn: ({ signal }) => axios.get('/api/me/recipients', { signal }),
    retry: false,
  });

  const recipients = useMemo(() => {
    const recipients = data?.data || [];
    return recipients.map((r: Recipient) => {
      return new Recipient(r.id, r.name, r.email);
    });
  }, [data]);

  return {
    recipients,
    isLoading,
    isSuccess,
    error,
  };
}

export class Recipient {
  id: number;
  name: string;
  email: string;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }

  // TODO [ToDr] To overcome issues with evergreen Combobox component
  trim() {
    this.toString().trim();
  }
}

export type MaybeRecipient = Recipient | string | null;
export type NewOrOldRecipient = Recipient | string;

export function isRecipientValid(recipient: MaybeRecipient) {
  if (recipient === null) {
    return true;
  }

  if (typeof recipient !== 'string') {
    return false;
  }

  if (recipient.trim() === '') {
    return true;
  }

  return false;
}
