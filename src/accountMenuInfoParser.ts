import {
  click,
  once,
  getPortalId,
  isNumericString,
  isNone,
  isSome,
  isValidListNavEntry,
} from './utils';
import {
  isNumber,
  createCache,
  waitForElement,
  waitForElements,
} from '@trevoratlas/utilities/src/index';
import { NS } from './data/constants';
import { createNavEntry, ListNavEntry, Nullable } from './types';

const KEY = `${NS}:account-menu-info`;

const cache = createCache<AccountMenuInfo>({
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

interface AccountMenuInfo {
  portals: ListNavEntry[];
  accountExtras: ListNavEntry[];
}

const getFilteredPortals = (portals: ListNavEntry[]) => {
  const portalId = getPortalId();
  return portals.filter((entry) => entry.metadata.portalId !== portalId);
};

// Some contents of the menu don't render before the menu has been opened
const populateAccountMenu = once(async () => {
  await waitForElement<HTMLButtonElement>('#account-menu')
    .then(click)
    .then((el) => {
      setTimeout(() => {
        click(el);
      }, 50);
    });
});

async function scrapeAccountMenuNavigation() {
  const accountExtras = await waitForElements<HTMLAnchorElement[]>(
    '.account-extras a'
  ).then((links) =>
    links
      .map((el) => {
        const href = el.getAttribute('href');
        const label = el.textContent?.trim();
        if (!href || !label) return;
        return createNavEntry({
          id: `account-menu-${href}`,
          href,
          label,
          type: 'account',
          description: `Account Extras/${label}`,
          metadata: {},
        });
      })
      .filter(isSome)
  );
  const profile: Nullable<ListNavEntry> =
    await waitForElement<HTMLAnchorElement>('.userpreferences a').then((el) => {
      const href = el.getAttribute('href');
      const label = el
        .querySelector('.user-info-preferences')
        ?.textContent?.trim();
      if (!href || !label) return;
      return createNavEntry({
        id: `account-menu-${href}`,
        href,
        label,
        type: 'account',
        description: `Account Extras/${label}`,
        metadata: {},
      });
    });
  if (isSome(profile)) {
    accountExtras.push(profile);
  }

  return accountExtras.filter(isSome);
}

async function scrapeAccountMenuPortals() {
  await populateAccountMenu();

  const portals = await waitForElements<HTMLAnchorElement[]>(
    '.navtools .navAccountSwitcher .navAccount a'
  ).then(
    (portals) =>
      portals
        .map((el) => {
          const href = el.getAttribute('href');
          const portalName = el
            .querySelector('.navAccount-accountName')
            ?.textContent?.replace(':', '')
            ?.trim();
          const portalId = el
            .querySelector('.navAccount-portalId')
            ?.textContent?.trim();

          if (
            isNone(href) ||
            isNone(portalName) ||
            !isNumericString(portalId)
          ) {
            return null;
          }
          return createNavEntry({
            id: `portal-switcher-${href}`,
            href,
            label: portalName,
            type: 'portal',
            description: `Switch to portal "${portalName}" (${portalId})`,
            metadata: {
              portalId: isNumber(portalId) ? portalId : Number(portalId),
            },
          });
        })
        .filter(Boolean) as ListNavEntry[]
  );

  const currentPortal = await waitForElement<HTMLAnchorElement>(
    '.navtools .navAccount-current'
  ).then((el) => {
    const portalId = getPortalId();
    const href = `/home-beta?portalId=${portalId}`;
    const portalName = el
      .querySelector('.navAccount-accountName')
      ?.textContent?.replace(':', '')
      ?.trim() as string;
    return createNavEntry({
      id: `portal-switcher-${href}`,
      href,
      label: portalName,
      type: 'portal',
      description: `Switch to portal "${portalName}" (${portalId})`,
      metadata: {
        portalId: isNumber(portalId) ? portalId : Number(portalId),
      },
    });
  });

  if (isSome(currentPortal)) {
    portals.push(currentPortal);
  }

  return portals.filter(isSome).filter(isValidListNavEntry);
}

export async function getAccountMenuInfo(): Promise<{
  portals: ListNavEntry[];
  accountExtras: ListNavEntry[];
}> {
  const isReady = await cache.isPrimed();
  if (isReady) {
    const result = await cache.get()!;
    const {
      value: { portals, accountExtras },
    } = result as any;
    return {
      portals: getFilteredPortals(portals),
      accountExtras,
    };
  }

  const portals = await scrapeAccountMenuPortals();
  const accountExtras = await scrapeAccountMenuNavigation();
  await cache.set({
    portals,
    accountExtras,
  });

  return {
    portals: getFilteredPortals(portals),
    accountExtras,
  };
}
