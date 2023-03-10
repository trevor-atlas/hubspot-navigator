import { ListNavEntry } from '@src/types';

export const NUMERIC = /\d+/;

export const NS = 'hubspot-navigator-extension';

export const suffixes: Record<ListNavEntry['type'], string> = {
  portal: 'đ ',
  account: 'đ¤',
  settings: 'âī¸',
  nav: 'đ',
  action: 'âŠī¸',
};
