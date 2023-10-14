import telegramImage from './images/telegram.svg';
import whatsappImage from './images/whatsapp.png';
import twitterImage from './images/twitter.png';
import emailImage from './images/email.png';

import { Adapter, AdapterType } from './types';

const createAdapter = (name: string, image: string, type: AdapterType): Adapter => ({
  id: name,
  image,
  name,
  type,
});

export const getAdapters = () => [
  createAdapter('Telegram', telegramImage, AdapterType.MESSAGE),
  createAdapter('Whatsapp', whatsappImage, AdapterType.MESSAGE),
  createAdapter('Email', emailImage, AdapterType.MESSAGE),
  createAdapter('Twitter', twitterImage, AdapterType.SOCIAL_NETWORK),
];
