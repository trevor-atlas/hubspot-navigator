import { NS } from '@src/data/constants';
import { useQueryStore } from '@src/store';
import { ListNavEntry } from '@src/types';
import { useRef } from 'react';
import { ListEntry } from './ListEntry';

export function SearchResults() {
  const self = useRef<HTMLUListElement>(null);
  const filtered = useQueryStore((state) => state.filteredEntries);
  const entries = useQueryStore((state) => state.queryEntries);
  const cursor = useQueryStore((state) => state.cursor);
  const setCursor = useQueryStore((state) => state.setCursor);
  const openLink = useQueryStore((state) => state.openSelected);

  if (!entries.length) {
    return (
      <li className={`${NS}-list-entry active`} title="Loading...">
        <div
          className={`${NS}-label--wrapper`}
          style={{
            paddingTop: '1rem',
            paddingBottom: '1rem',
            textAlign: 'center',
          }}
        >
          <span className={`${NS}-label`} style={{ textAlign: 'center' }}>
            Loading...
          </span>
        </div>
      </li>
    );
  }

  if (!filtered.length) {
    return (
      <li
        tabIndex={1}
        onFocus={() => setCursor(0)}
        className={`${NS}-list-entry active`}
        title="No results found"
      >
        <div className={`${NS}-label--wrapper`}>
          <span className={`${NS}-label`}>No results found</span>
          <span className={`${NS}-description`}>Try a different query</span>
        </div>
      </li>
    );
  }

  return (
    <ul className={`${NS}-search-results`}>
      {filtered.map((item: ListNavEntry, i: number) => (
        <ListEntry
          parent={self}
          key={item.href}
          index={i}
          active={i === cursor}
          item={item}
          onClick={openLink}
          onSelect={() => setCursor(i)}
        />
      ))}
    </ul>
  );
}
