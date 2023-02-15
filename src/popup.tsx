import { useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalOverlay } from './components/GlobalOverlay';
import { SearchInput } from './components/SearchInput';
import { NUMERIC } from './data/constants';
import { useQueryStore } from './store';
import { SearchResults } from './components/SearchResults';

function useKeyboardShortcuts() {
  const reset = useQueryStore((state) => state.reset);
  const cursor = useQueryStore((state) => state.cursor);
  const cursorUp = useQueryStore((state) => state.cursorUp);
  const cursorDown = useQueryStore((state) => state.cursorDown);
  const setCursor = useQueryStore((state) => state.setCursor);
  const filtered = useQueryStore((state) => state.filteredEntries);
  const hide = useQueryStore((state) => state.hide);
  const toggleVisibility = useQueryStore((state) => state.toggleVisibility);
  const openSelected = useQueryStore((state) => state.openSelected);

  useEffect(() => {
    function handleKeyDown({
      key,
      shiftKey,
      ctrlKey,
      metaKey,
      altKey,
    }: KeyboardEvent) {
      if (cursor >= filtered.length) {
        setCursor(0);
      }

      if (shiftKey && (metaKey || ctrlKey) && key.toLowerCase() === 'p') {
        toggleVisibility();
        reset();
      }

      switch (key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          return openSelected(key);
        case 'Escape': {
          hide();
          return reset();
        }
        case 'Enter':
          return openSelected();
        case 'ArrowUp':
          return cursorUp();
        case 'ArrowDown':
          return cursorDown();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cursor, filtered]);
}

const Popup = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateEntries = useQueryStore((state) => state.updateQueryEntries);
  const setFilter = useQueryStore((state) => state.setQuery);
  const visible = useQueryStore((state) => state.visible);
  const hide = useQueryStore((state) => state.hide);

  useKeyboardShortcuts();

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    }
  }, [visible]);

  useEffect(updateEntries, []);
  useEffect(updateEntries, [visible]);

  const handleOverlayClick = useCallback(() => {
    hide();
    setFilter('');
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <>
      <div className="hubspot-navigator-ext-container" aria-hidden={visible}>
        <div className="hubspot-navigator-ext-wrapper">
          <SearchInput ref={inputRef} />
          <div className="hubspot-navigator-ext-content">
            <SearchResults />
          </div>
        </div>
      </div>
      <GlobalOverlay handleClick={handleOverlayClick} />
    </>
  );
};
const ROOT_ID = 'hubspot-navigator-ext-root';

function start() {
  if (document.getElementById(ROOT_ID)) {
    return;
  }
  const host = document.createElement('div');
  host.id = ROOT_ID;
  document.body.appendChild(host);
  const root = createRoot(host);

  root.render(<Popup />);
}

start();
