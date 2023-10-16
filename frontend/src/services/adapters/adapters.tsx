import { IconDefinition, faMailchimp, faTelegram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type AdapterType = 'social' | 'message';

export type Adapter = {
  id: string;
  name: string;
  text: string;
  icon: JSX.Element;
  type: AdapterType;
};

const createAdapter = (name: string, text: string, icon: IconDefinition, type: AdapterType): Adapter => ({
  id: name,
  icon: <FontAwesomeIcon icon={icon} />,
  text,
  name,
  type,
});

export const getAdapters = () => [
  createAdapter('Telegram', `I don't reply on Telegram`, faTelegram, 'message'),
  createAdapter('Whatsapp', `I don't reply on Whatsapp`, faWhatsapp, 'message'),
  createAdapter('E-mail', `I don't respond to e-mails`, faMailchimp, 'message'),
  createAdapter('Twitter', `I'm not active on Twitter`, faTwitter, 'social'),
];

export const MAX_AND_ITEMS = getAdapters().length;
export const MAX_OR_GROUPS = 3;
