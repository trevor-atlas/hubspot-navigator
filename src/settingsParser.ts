import {
  createCache,
  isNone,
  isNumber,
  isSome,
  waitForElements,
} from '@trevoratlas/utilities';
import { NS } from './data/constants';
import { createNavEntry, ListNavEntry } from './types';
import { getPortalId } from './utils';

const KEY = `${NS}:account-settings`;

const cache = createCache<ListNavEntry[]>({
  writer: async (value) => {
    const portalId = getPortalId();
    const key = `${portalId}-${KEY}`;
    const parsed = JSON.stringify(value);
    await chrome.storage.local.set({ [key]: parsed });
  },
  reader: async () => {
    const portalId = getPortalId();
    const key = `${portalId}-${KEY}`;
    const value = (await chrome.storage.local.get(key)) as any;
    if (!value || !(key in value)) return null;
    return JSON.parse(value[key]);
  },
  validator: async (entry) => {
    if (isNone(entry)) return true;
    const { lastUpdated } = entry;
    if (!isNumber(lastUpdated)) return true;
    const diff = Date.now() - lastUpdated;
    return diff > 1000 * 60 * 60 * 24;
  },
});

export async function scrapeSettings(): Promise<ListNavEntry[]> {
  return waitForElements<HTMLAnchorElement[]>('.page nav > h5').then(
    (headings) =>
      headings
        .map((heading) => {
          const header = heading.textContent?.trim();
          const links = heading.nextElementSibling?.querySelectorAll('a');
          return Array.from(links || [])
            .map((el) => {
              const href = el.getAttribute('href');
              const label = el.textContent?.trim();
              if (!href || !label) return;
              return createNavEntry({
                id: `settings-nav-${href}`,
                href,
                label,
                type: 'settings',
                description: `Settings/${header}/${label}`,
                metadata: {},
              });
            })
            .filter(isSome);
        })
        .flat()
  );
}

export async function getSettings(): Promise<ListNavEntry[]> {
  const isReady = await cache.isPrimed();
  if (isReady) {
    const result = await cache.get()!;
    const { value } = result as any;
    return value;
  }

  const settings = await scrapeSettings();
  await cache.set(settings);

  return settings;
}
