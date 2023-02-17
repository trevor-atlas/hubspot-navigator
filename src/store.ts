import { create } from 'zustand';
import { NS, NUMERIC } from './data/constants';
import { ListNavEntry } from './navigationParser';
import {
  setLocalStorageValue,
  getNavStructure,
  getLocalStorageValue,
} from './utils';
import Fuse from 'fuse.js';
import { Nullable } from './types';

const options: Fuse.IFuseOptions<ListNavEntry> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.5,

  keys: [
    {
      name: 'label',
      weight: 0.9,
    },
    {
      name: 'description',
      weight: 0.1,
    },
  ],
};

type ListNavEntryMetadata = Record<
  ListNavEntry['href'],
  Nullable<{ uses: number; favorite: boolean; lastUsed: number }>
>;

const KEY = `${NS}:entry-metadata`;
export function getEntryMetadata() {
  return getLocalStorageValue<ListNavEntryMetadata>(KEY) || {};
}

function setMostFrequent(href: string) {
  const mostFrequentEntries = getEntryMetadata();
  const item = mostFrequentEntries[href];
  if (item) {
    item.uses = (item.uses ?? 0) + 1;
    item.lastUsed = Date.now();
  } else {
    mostFrequentEntries[href] = {
      uses: 1,
      favorite: false,
      lastUsed: Date.now(),
    };
  }
  setLocalStorageValue(KEY, mostFrequentEntries);
}

interface QueryStore {
  query: string;
  cursor: number;
  visible: boolean;
  queryEntries: ListNavEntry[];
  filteredEntries: ListNavEntry[];
  fuse: Fuse<ListNavEntry> | null;
  entryMetadata: ListNavEntryMetadata;
  show: () => void;
  hide: () => void;
  toggleVisibility: () => void;
  setQuery: (query: string) => void;
  setCursor: (cursor: number) => void;
  cursorUp: () => void;
  cursorDown: () => void;
  updateQueryEntries: () => void;
  reset: () => void;
  openSelected: (key?: string) => void;
  setFavorite: (href: string) => void;
  isFavorite: (href: string) => boolean;
}

export const useQueryStore = create<QueryStore>((set, get) => {
  return {
    query: '',
    cursor: 0,
    visible: false,
    queryEntries: [],
    filteredEntries: [],
    entryMetadata: {},
    fuse: null,
    show: () => {
      set({ visible: true, entryMetadata: getEntryMetadata() });
    },
    hide: () => {
      set({ visible: false });
    },
    toggleVisibility: () => {
      set({ visible: !get().visible, entryMetadata: getEntryMetadata() });
    },
    reset: () => {
      set({
        query: '',
        cursor: 0,
        filteredEntries: get().queryEntries,
        entryMetadata: getEntryMetadata(),
      });
    },
    setCursor: (cursor: number) => {
      set({ cursor });
    },
    cursorUp: () => {
      const c = get().cursor;
      set({ cursor: c - 1 < 0 ? get().filteredEntries.length - 1 : c - 1 });
    },
    cursorDown: () => {
      const c = get().cursor;
      const hasEntries = c + 1 < get().filteredEntries.length;
      set({ cursor: hasEntries ? c + 1 : 0 });
    },
    updateQueryEntries: async () => {
      const structure = await getNavStructure();
      const mostFrequent = getEntryMetadata();
      set({
        queryEntries: structure.sort((a: ListNavEntry, b: ListNavEntry) => {
          const aEntry = mostFrequent[a.href] || { uses: 0, favorite: false };
          const bEntry = mostFrequent[b.href] || { uses: 0, favorite: false };
          if (aEntry.favorite) {
            return -1000;
          } else if (bEntry.favorite) {
            return 1000;
          }
          const aFreq = aEntry.uses;
          const bFreq = bEntry.uses;
          return bFreq - aFreq;
        }),
        entryMetadata: getEntryMetadata(),
        fuse: new Fuse(structure, options),
      });
    },
    setQuery: (query: string) => {
      const { fuse, queryEntries } = get();
      if (!query) {
        set({ query, filteredEntries: queryEntries });
      } else {
        set({
          query,
          filteredEntries: fuse!.search(query).map(({ item }) => item),
        });
      }
    },
    openSelected: (key?: string) => {
      const { filteredEntries, cursor } = get();
      if (key && NUMERIC.test(key)) {
        const keyIndex = parseInt(key) - 1;
        const href = filteredEntries[keyIndex].href;
        setMostFrequent(href);
        window.location.href = filteredEntries[keyIndex].href;
      } else {
        const href = get().filteredEntries[cursor].href;
        setMostFrequent(href);
        window.location.href = href;
      }
    },
    setFavorite: (href: string) => {
      const entryMetadata = getEntryMetadata();
      const item = entryMetadata[href];
      if (!item) {
        entryMetadata[href] = { uses: 0, favorite: true };
      } else {
        item.favorite = !item.favorite;
        entryMetadata[href] = item;
      }
      setLocalStorageValue(KEY, entryMetadata);
      set({ entryMetadata, filteredEntries: [...get().filteredEntries] });
    },
    isFavorite: (href: string) => {
      const entryMetadata = get().entryMetadata;
      const item = entryMetadata[href];
      return item ? item.favorite : false;
    },
  };
});
