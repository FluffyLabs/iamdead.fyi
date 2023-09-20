export enum Steps {
  Security = 'security',
  ProofOfLife = 'proof-of-life',
  Message = 'message',
}

export const DEFAULT_STEP = Steps.Security;
export const DEFAULT_WIZARD_ROUTE = `/wizard/${DEFAULT_STEP}`;
