import { useQuery } from '@tanstack/react-query';
import { axios } from '../../services/axios';
import { Recipient } from './use-recipients';

export type Testament = {
  chunksConfiguration: {
    required: number;
    spare: number;
  };
  gracePeriod: number;
  encryptedMessageRaw: string[];
  chunks: TestamentChunk[];
  proofOfLife: TestamentProofOfLife[][];
};

export type TestamentChunk = {
  chunk: string;
  description: string;
  recipient: TestamentRecipient;
};

export type TestamentRecipient = Recipient & {
  adapters?: TestamentAdapter[];
};

export type TestamentAdapter = {
  kind: string;
  userId: number | null;
  recipientId: number | null;
  testamentId: number | null;
  handle: string;
};

export type TestamentProofOfLife = {
  kind: string;
  months: number;
};

export function useTestaments() {
  const { isLoading, error, data, isSuccess } = useQuery({
    queryKey: ['testaments'],
    queryFn: ({ signal }) => axios.get('/api/me/testaments', { signal }),
    retry: false,
  });

  const testaments: Testament[] = data?.data || [];

  return {
    testaments,
    storeTestament,
    isLoading,
    isSuccess,
    error,
  };
}

async function storeTestament(testament: Testament) {
  const response = await axios.post('/api/me/testaments', testament);
  console.log(response);
}
