import { getAccountMenuInfo } from './accountMenuInfoParser';
import { settings } from './data/settings';
import { ListNavEntry, NavConfig, NavItem } from './types';

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
    {
      href: 'https://app.hubspot.com/contacts/21250524/objects/0-3/views/all/list?createNewObject=DEAL',
      text: 'Create Deal',
    },
    {
      href: 'https://app.hubspot.com/contacts/21250524/objects/0-5/views/all/list?createNewObject=TICKET',
      text: 'Create Ticket',
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
