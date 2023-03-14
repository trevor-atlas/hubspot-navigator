import { Primitive } from '@trevoratlas/utilities/src/types/common';
import { z } from 'zod';
import { parsePortalIDs, sanitizePortalId, stripDomain } from './utils';

export type None = null | undefined;
export type Nullable<T> = T | None;

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
  portalType: 'DEFAULT';
  settings: Record<string, any>;
  gates: string[];
  hasWorkflowsAccess: boolean;
}

export interface NavNode {
  id: string;
  label: string;
  path?: string;
  groupPaths?: string[];
  isMoved?: boolean;
  canBeHomePage?: boolean;
  isSectionHeader?: boolean;
  children?: NavNode[];
}

export interface NavSettings {
  [key: number]: {
    isRedesignedNav: boolean;
    children: NavNode[];
    portal: Portal;
    user: User;
  };
}

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

export interface NavItem {
  children?: NavItem[];
  id: string;
  label?: string;
  path?: string;
}

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
};

export type NavEntryType = 'portal' | 'account' | 'settings' | 'nav' | 'action';

export type ListNavEntry = {
  id: string;
  href: string;
  label: string;
  description: string | null;
  type: NavEntryType;
  metadata: NavEntryType extends 'portal'
    ? { portalId: number }
    : Record<string, Primitive>;
};

export const ListNavEntrySchema = z.object({
  id: z.string(),
  href: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  type: z.enum(['portal', 'account', 'settings', 'nav', 'action']),
  metadata: z.record(z.any()),
});

export function createNavEntry({
  id,
  href,
  label,
  description,
  type,
  metadata,
}: ListNavEntry): Nullable<ListNavEntry> {
  const entry = {
    id,
    href: stripDomain(sanitizePortalId(href)),
    label,
    description,
    type,
    metadata,
  };
  return ListNavEntrySchema.safeParse(entry).success ? entry : null;
}
