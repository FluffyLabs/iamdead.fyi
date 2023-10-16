import { IconDefinition, faMailchimp, faTelegram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type AdapterType = 'social' | 'message';

export type Adapter = {
  id: string;
  name: string;
  icon: JSX.Element;
  type: AdapterType;
};

const createAdapter = (name: string, icon: IconDefinition, type: AdapterType): Adapter => ({
  id: name,
  icon: <FontAwesomeIcon icon={icon} />,
  name,
  type,
});

export const getAdapters = () => [
  createAdapter('Telegram', faTelegram, 'message'),
  createAdapter('Whatsapp', faWhatsapp, 'message'),
  createAdapter('Email', faMailchimp, 'message'),
  createAdapter('Twitter', faTwitter, 'social'),
];

export const MAX_ADAPTERS = getAdapters().length;
