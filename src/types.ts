export type Nullable<T> = T | null | undefined;

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
