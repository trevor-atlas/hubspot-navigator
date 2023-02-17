import { NUMERIC } from '@src/data/constants';
import { useQueryStore } from '@src/store';
import { ChangeEvent, forwardRef, useCallback } from 'react';
import { SearchIcon } from './SearchIcon';

export const SearchInput = forwardRef<HTMLInputElement>((props, ref) => {
  const query = useQueryStore((state) => state.query);
  const setQuery = useQueryStore((state) => state.setQuery);
  const hide = useQueryStore((state) => state.hide);
  const reset = useQueryStore((state) => state.reset);

  const updateQuery = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!NUMERIC.test(e.target.value)) {
        setQuery(e.target.value);
      }
    },
    [setQuery]
  );
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="hubspot-navigator-ext-search"
        tabIndex={1}
        placeholder="Search..."
        ref={ref}
        type="text"
        autoFocus
        value={query}
        onChange={updateQuery}
      />
      <SearchIcon />

      {/* close button */}
      <ClearButton
        onClick={() => {
          setQuery('');
          ref?.current?.focus();
        }}
      />
    </div>
  );
});

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <svg
      onClick={onClick}
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
      className="hubspot-navigator-ext-search-clear-icon"
    >
      <path d="M14.5,1.5l-13,13m0-13,13,13" transform="translate(-1 -1)" />
    </svg>
  );
}
