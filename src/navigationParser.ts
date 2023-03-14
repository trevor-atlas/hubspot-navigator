import { getAccountMenuInfo } from './accountMenuInfoParser';
import { getSettings } from './settingsParser';
import { getActions } from './data/actions';
import { suffixes } from './data/constants';
import { createNavEntry, ListNavEntry, NavConfig, NavItem } from './types';
import { getPortalId, isSome, parsePortalIDs, stripDomain } from './utils';

export async function maybeUpdateEntries() {
  if (window.location.pathname.includes('/settings')) {
    // update settings nav entries
    await getSettings();
  }
}

function flattenTree(
  item: NavItem,
  parsedNav: Record<string, ListNavEntry>,
  path: string = ''
): void {
  const isParent = !('path' in item) && item.children && item.label;
  let description = path;
  if (isParent) {
    description = path ? `${path}/${item.label}` : `${item.label}`;
  }
  if (item.path && item.label) {
    const description = path ? `${path}/${item.label}` : `${item.label}`;
    const { children, ...rest } = item;
    const entry = createNavEntry({
      id: item.id,
      label:
        item.label ||
        item.id ||
        `NO LABEL FOR ${JSON.stringify(rest, null, 2)}`,
      href: item.path || '',
      description,
      type: 'nav',
      metadata: {},
    });
    if (isSome(entry)) {
      parsedNav[entry.href] = entry;
    }
  }
  if (!item.children) return;
  for (const child of item.children) {
    flattenTree(child, parsedNav, description);
  }
}

export async function collateNavConfig(config: NavConfig) {
  const parsedNav: Record<string, ListNavEntry> = {};

  const settings = await getSettings();
  settings.forEach((setting) => {
    parsedNav[setting.href] = setting;
  });
  const { portals, accountExtras } = await getAccountMenuInfo();
  portals.forEach((portal) => {
    parsedNav[portal.href] = portal;
  });
  accountExtras.forEach((entry) => {
    parsedNav[entry.href] = entry;
  });

  const actions = await getActions();
  actions.forEach((action) => {
    parsedNav[action.href] = action;
  });

  for (const item of config.children) {
    flattenTree(item, parsedNav);
  }

  const result = Object.values(parsedNav).map(formatEntry);
  console.log(result.map((e) => e.href));

  return result;
}

function formatEntry(entry: ListNavEntry) {
  return {
    id: entry.id,
    href: stripDomain(parsePortalIDs(entry.href)),
    label: `${suffixes[entry.type]} ${entry.label}`,
    description: entry.description,
    type: entry.type,
    metadata: entry.metadata,
  };
}
