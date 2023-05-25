export enum Steps {
  Security = 'security',
  Recipients = 'recipients',
  ProofOfLife = 'proof-of-life',
  Message = 'message',
}

export const DEFAULT_STEP = Steps.Security;
export const DEFAULT_WIZZARD_ROUTE = `/wizzard/${DEFAULT_STEP}`;
