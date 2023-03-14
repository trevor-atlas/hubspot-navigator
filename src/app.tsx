import { useCallback, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { GlobalOverlay } from './components/GlobalOverlay';
import { SearchInput } from './components/SearchInput';
import { useQueryStore } from './store';
import { SearchResults } from './components/SearchResults';
import { useKeyboardHandler } from './hooks/useKeyboardHandler';

function ActionSelector() {
  return (
    <div className="hubspot-navigator-ext-action-selector">
      <div className="hubspot-navigator-ext-action active">
        <span>Search</span>
      </div>
      <div className="hubspot-navigator-ext-action">
        <span>Portals</span>
      </div>
      <div className="hubspot-navigator-ext-action">
        <span>Actions</span>
      </div>
    </div>
  );
}

const Popup = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateEntries = useQueryStore((state) => state.updateQueryEntries);
  const setFilter = useQueryStore((state) => state.setQuery);
  const visible = useQueryStore((state) => state.visible);
  const hide = useQueryStore((state) => state.hide);

  useKeyboardHandler();

  useEffect(() => {
    updateEntries();
    if (visible) {
      inputRef.current?.focus();
    }
    if (!visible) {
      updateEntries();
    }
  }, [visible]);

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
        <SearchInput ref={inputRef} />
        {/* <ActionSelector /> */}
        <div className="hubspot-navigator-ext-content">
          <SearchResults />
        </div>
      </div>
      <GlobalOverlay handleClick={handleOverlayClick} />
    </>
  );
};
const ROOT_ID = 'hubspot-navigator-ext-root';

async function start() {
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  useQueryStore.getState().updateQueryEntries();

  const host = document.createElement('div');
  host.id = ROOT_ID;
  document.body.appendChild(host);
  render(<Popup />, host);
}

start();
