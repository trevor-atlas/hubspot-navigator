import { getAccountMenuInfo } from './accountMenuInfoParser';
import { settings } from './data/settings';
import { Nullable } from './types';
import {
  $,
  $$,
  click,
  isSome,
  once,
  sleep,
  waitForElement,
  waitForElements,
} from './utils';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUri: string;
  scopes: string[];
  attributes: Record<string, any>;
  displayLanguage: string;
}

export interface Portal {
  portalId: number;
  hubAccountNameOrDomain: string;
  gates: string[];
}

export interface NavItem {
  children?: NavItem[];
  id: string;
  label?: string;
  path?: string;
}

type URLs = Map<
  string,
  {
    parentId: string;
    currentId: string;
  }
>;

export type NavConfig = {
  children: NavItem[];
  isAccurate: boolean;
  portal: Portal;
  translations: Record<string, string>;
  user: User;
  newButton: {
    id: string;
    label: string;
    path?: string;
  }[];
  experimentStatuses?: {
    experiments?: Record<string, unknown>;
  };
} & {};

function getActions() {
  const actions = [
    {
      href: 'https://app.hubspot.com/contacts/%PORTALID%/contacts/list/view/all?createNewObject=CONTACT',
      text: 'Create Contact',
    },
    {
      href: 'https://app.hubspot.com/contacts/%PORTALID%/companies/list/view/all?createNewObject=COMPANY',
      text: 'Create Company',
    },
  ];
}

const flattenTree = (
  item: NavItem,
  parsedNav: Record<string, ListNavEntry>,
  path: string = ''
): void => {
  const isParent = !('path' in item) && item.children && item.label;
  let description = path;
  if (isParent) {
    description = path ? `${path}/${item.label}` : `${item.label}`;
  }
  if (item.path && item.label) {
    const description = path ? `${path}/${item.label}` : `${item.label}`;
    const { children, ...rest } = item;
    parsedNav[item.path as any] = {
      id: item.id,
      label:
        item.label ||
        item.id ||
        `NO LABEL FOR ${JSON.stringify(rest, null, 2)}`,
      href: item.path || '',
      description,
    };
  }
  if (!item.children) return;
  for (const child of item.children) {
    flattenTree(child, parsedNav, description);
  }
};

export type ListNavEntry = {
  id: string;
  href: string;
  label: string;
  description: string | null;
};

export async function collateNavConfig(config: NavConfig) {
  const parsedNav: Record<string, ListNavEntry> = {}; //Array<ListNavEntry> = [];

  const { portals, accountExtras } = await getAccountMenuInfo();
  portals.forEach((portal) => {
    parsedNav[portal.href] = portal;
  });
  accountExtras.forEach((entry) => {
    parsedNav[entry.href] = entry;
  });

  for (const item of config.children) {
    flattenTree(item, parsedNav);
  }
  for (const [category, entries] of Object.entries(settings)) {
    for (const entry of entries) {
      parsedNav[entry.href] = {
        id: entry.href,
        label: entry.label,
        href: entry.href.replace(
          '%PORTALID%',
          config.portal.portalId.toString()
        ),
        description: `Settings/${category}`,
      };
    }
  }
  return Object.values(parsedNav);
}

export const getActiveNavigationItems = ({
  path,
  urls,
}: {
  path: string;
  urls: URLs;
}) => {
  const current = path.split('/');
  while (current.length && !urls.has(current.join('/'))) {
    current.pop();
  }

  return current.length > 0 ? urls.get(current.join('/')) : {};
};
