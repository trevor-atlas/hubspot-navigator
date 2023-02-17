import { NS, NUMERIC } from './data/constants';
import { ListNavEntry } from './navigationParser';
import {
  waitForElement,
  click,
  waitForElements,
  once,
  setLocalStorageValue,
  getLocalStorageValue,
  getPortalId,
  isNumericString,
  isNone,
  isSome,
} from './utils';

const KEY = `${NS}:account-menu-info`;

type PortalNavEntry = ListNavEntry & { portalId: number };

interface AccountMenuInfo {
  portals: PortalNavEntry[];
  accountExtras: ListNavEntry[];
  lastUpdated: number;
}

const getFilteredPortals = (portals: PortalNavEntry[]) => {
  const portalId = getPortalId();
  return portals.filter((portal) => portal.portalId !== portalId);
};

export const getAccountInfo = () => {
  const accountInfo = getLocalStorageValue<AccountMenuInfo>(KEY);
  if (isNone(accountInfo)) {
    return null;
  }
  return {
    ...accountInfo,
    portals: getFilteredPortals(accountInfo.portals),
  };
};

function writeAccountInfo(data: Omit<AccountMenuInfo, 'lastUpdated'>) {
  const accountMenuInfo: AccountMenuInfo = {
    ...data,
    lastUpdated: Date.now(),
  };
  setLocalStorageValue(KEY, accountMenuInfo);
}

function isAccountInfoStale(accountInfo: AccountMenuInfo) {
  if (isNone(accountInfo)) return true;
  const { lastUpdated } = accountInfo;
  const diff = Date.now() - lastUpdated;
  return diff > 1000 * 60 * 60 * 24;
}

// Some contents of the menu don't render before the menu has been opened
const populateAccountMenu = once(async () => {
  await waitForElement<HTMLButtonElement>('#account-menu', 25)
    .then(click)
    .then((el) => {
      setTimeout(() => {
        click(el);
      }, 50);
    });
});

async function scrapeAccountMenuNavigation() {
  const accountExtras = await waitForElements<HTMLAnchorElement[]>(
    '.account-extras a',
    25
  ).then((links) =>
    links.map((el) => {
      const href = el.getAttribute('href');
      const label = el.textContent?.trim();
      if (!href || !label) return;
      return {
        id: `account-menu-${href}`,
        href,
        label,
        description: `Account Extras/${label}`,
      };
    })
  );
  const profile = await waitForElement<HTMLAnchorElement>(
    '.userpreferences a',
    25
  ).then((el) => {
    const href = el.getAttribute('href');
    const label = el
      .querySelector('.user-info-preferences')
      ?.textContent?.trim();
    if (!href || !label) return;
    return {
      id: `account-menu-${href}`,
      href,
      label,
      description: `Account Extras/${label}`,
    };
  });

  accountExtras.push(profile);

  return accountExtras.filter(Boolean) as ListNavEntry[];
}

async function scrapeAccountMenuPortals() {
  await populateAccountMenu();

  const portals = await waitForElements<HTMLAnchorElement[]>(
    '.navtools .navAccountSwitcher .navAccount a',
    25
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

          if (!portalName || !isNumericString(portalId)) return;
          return {
            id: `portal-switcher-${href}`,
            href,
            label: portalName,
            description: `Switch to the "${portalName}" portal`,
            portalId: Number(portalId),
          };
        })
        .filter(Boolean) as PortalNavEntry[]
  );

  const currentPortal = (await waitForElement<HTMLAnchorElement>(
    '.navtools .navAccount-current',
    25
  ).then((el) => {
    const portalId = getPortalId();
    const href = `/home-beta?portalId=${portalId}`;
    const portalName = el
      .querySelector('.navAccount-accountName')
      ?.textContent?.replace(':', '')
      ?.trim() as string;
    return {
      id: `portal-switcher-${href}`,
      href: href,
      label: portalName,
      description: `Switch to the "${portalName}" portal`,
      portalId: portalId,
    };
  })) as PortalNavEntry;

  portals.push(currentPortal);
  return portals;
}

export async function getAccountMenuInfo() {
  const cachedAccountInfo = getAccountInfo();
  if (isSome(cachedAccountInfo) && !isAccountInfoStale(cachedAccountInfo)) {
    return cachedAccountInfo;
  }

  const portals = await scrapeAccountMenuPortals();
  const accountExtras = await scrapeAccountMenuNavigation();
  writeAccountInfo({
    portals,
    accountExtras,
  });
  return getAccountInfo()!;
}
