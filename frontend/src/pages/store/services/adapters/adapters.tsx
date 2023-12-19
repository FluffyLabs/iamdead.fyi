import { IconDefinition, faMailchimp, faTelegram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type AdapterType = 'social' | 'message';

export type Adapter = {
  kind: string;
  name: string;
  text: string;
  icon: JSX.Element;
  type: AdapterType;
};

export type ConfiguredAdapter = Adapter & {
  months: number;
};

const createAdapter = (kind: string, name: string, text: string, icon: IconDefinition, type: AdapterType): Adapter => ({
  kind,
  icon: <FontAwesomeIcon icon={icon} />,
  text,
  name,
  type,
});

export const getAdapters = () => [
  createAdapter('telegram', 'Telegram', `I don't reply on`, faTelegram, 'message'),
  createAdapter('whatsapp', 'Whatsapp', `I don't reply on`, faWhatsapp, 'message'),
  createAdapter('email', 'E-mail', `I don't respond to`, faMailchimp, 'message'),
  createAdapter('twitter', 'X', `I'm not active on`, faTwitter, 'social'),
];

export const MAX_AND_ITEMS = getAdapters().length;
export const MAX_OR_GROUPS = 3;
