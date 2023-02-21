import { NS } from '@src/data/constants';
import { ListNavEntry } from '@src/navigationParser';
import { useQueryStore } from '@src/store';
import { useRef } from 'react';
import { ListEntry } from './ListEntry';

export function SearchResults() {
  const self = useRef<HTMLUListElement>(null);
  const filtered = useQueryStore((state) => state.filteredEntries);
  const cursor = useQueryStore((state) => state.cursor);
  const setCursor = useQueryStore((state) => state.setCursor);
  const openLink = useQueryStore((state) => state.openSelected);

  if (!filtered.length) {
    return (
      <ListEntry
        parent={self}
        key="no-results"
        index={0}
        active={true}
        onClick={() => {}}
        onSelect={() => {}}
      />
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
