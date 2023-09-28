export enum AdapterType {
  SOCIAL_NETWORK = 'SOCIAL_NETWORK',
  MESSAGE = 'MESSAGE',
}

export type Adapter = {
  id: string;
  name: string;
  image: string;
  type: AdapterType;
};
