import { NS, NUMERIC } from './data/constants';
import { collateNavConfig, NavConfig } from './navigationParser';
import { Nullable } from './types';

export function setLocalStorageValue<T>(key: string, value: T) {
  const marshaled = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, marshaled);
}

export function getLocalStorageValue<T>(key: string): Nullable<T> {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch {
    return null;
  }
}

export function $<ElementType extends Element>(selector: string) {
  return document.querySelector<ElementType>(selector);
}

export function $$<ElementType extends Element>(selector: string) {
  return [...document.querySelectorAll<ElementType>(selector)];
}

export function getNavStructure() {
  const portalId = window.location.href
    .split('/')
    .find((part) => NUMERIC.test(part));
  const navconfig = getLocalStorageValue<{ [key: string]: NavConfig }>(
    'hubspot_navconfigs'
  );
  if (!navconfig || !portalId) {
    return [];
  }

  return collateNavConfig(navconfig[portalId]);
}

export function openLink(href: string) {
  window.location.href = href;
}
