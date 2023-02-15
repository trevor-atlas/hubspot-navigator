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
      <div
        style={{
          color: 'rgba(37, 51, 66, 0.5)',
          position: 'absolute',
          right: '14px',
          top: '8px',
          height: '24px',
          width: '24px',
          fontSize: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          padding: '8px',
          '-webkit-touch-callout': 'none',
          '-webkit-user-select': 'none',
          '-khtml-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
        }}
        onClick={() => {
          setQuery('');
          ref?.current?.focus();
        }}
      >
        ✕
      </div>
    </div>
  );
});
