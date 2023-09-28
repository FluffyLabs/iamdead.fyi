import { Adapter, AdapterType } from '../../../services/adapters';

export const isMessageAdapter = (adapter: Adapter) => adapter.type === AdapterType.MESSAGE;
export const isSocialAdapter = (adapter: Adapter) => adapter.type === AdapterType.SOCIAL_NETWORK;
