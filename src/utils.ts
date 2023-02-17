import { NS, NUMERIC } from './data/constants';
import { collateNavConfig, NavConfig } from './navigationParser';
import { Nullable } from './types';

function getActions() {
  const actions = [
    {
      href: 'https://app.hubspot.com/contacts/21250524/contacts/list/view/all?createNewObject=CONTACT',
      text: 'Create Contact',
    },
    {
      href: 'https://app.hubspot.com/contacts/21250524/companies/list/view/all?createNewObject=COMPANY',
      text: 'Create Company',
    },
  ];
}

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

export function $<ElementType extends HTMLElement>(
  selector: string
): Nullable<ElementType | ElementType[]> {
  const maybeEl = document.querySelector<ElementType>(selector);
  if (!maybeEl) {
    return null;
  }

  return maybeEl;
}

export function $$<ElementType extends Element>(selector: string) {
  return [...document.querySelectorAll<ElementType>(selector)];
}

export function getPortalId(): number {
  const config = getLocalStorageValue<{ [key: string]: string }>(
    'hubspot_navconfigs'
  );
  if (!config) {
    return Number(window.location.href.split('/').find(isNumericString));
  }
  return Object.keys(config).map(Number).find(isNumeric) || 0;
}

export async function getNavStructure() {
  const portalId = getPortalId();
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

export const sleep = (ms = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isSome = <T>(value: Nullable<T>): value is T =>
  value !== null && value !== undefined;

export const isNone = <T>(value: Nullable<T>): value is null | undefined =>
  !isSome(value);

export const isNumericString = (
  value: Nullable<string>
): value is `${number}` => isSome(value) && NUMERIC.test(value);

export const isNumeric = (value: Nullable<number>): value is number =>
  isSome(value) && typeof value === 'number';

export async function waitForElements<ElementType extends HTMLElement[]>(
  selector: string,
  timeout = 100
) {
  return new Promise<ElementType>((resolve) => {
    const interval = setInterval(() => {
      const el = $$(selector);
      if (el && el.length) {
        clearInterval(interval);
        resolve(el as ElementType);
      }
    }, timeout);
  });
}

export async function waitForElement<ElementType extends HTMLElement>(
  selector: string,
  timeout = 100
) {
  return new Promise<ElementType>((resolve) => {
    const interval = setInterval(() => {
      const el = $(selector);
      if (el) {
        clearInterval(interval);
        resolve(el as ElementType);
      }
    }, timeout);
  });
}

export function click<ElementType extends HTMLElement>(
  el: Nullable<ElementType>
) {
  if (isSome(el) && 'click' in el) {
    el.click();
  }
  return el;
}

export function once<T>(fn: (...args: any[]) => T) {
  let called = false;
  let result: T;
  return async (...args: any[]) => {
    if (!called) {
      result = await fn(...args);
      called = true;
    }
    return result;
  };
}
