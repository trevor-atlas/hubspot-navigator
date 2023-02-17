import { useQueryStore } from '@src/store';
import { useEffect } from 'react';

export function useKeyboardHandler() {
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
