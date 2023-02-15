import { NS } from '@src/data/constants';
import { ReactNode, useEffect } from 'react';

export function GlobalOverlay({ handleClick }: { handleClick: () => void }) {
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.overflow = 'auto';
    handleClick();
  };
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999,
        backgroundColor: 'rgba(45, 62, 80, 0.79)',
        backdropFilter: 'blur(2px)',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <ul className={`${NS}-guide`}>
        <li title="command or control + shift + p toggles window visibility">
          ⌘+⇧+p: <span>Open/Close</span>
        </li>
        <li title="Press Escape to close the window">
          Escape: <span>Close</span>
        </li>
        <li title="Press 1 through 9 to select that entry in the list">
          1-9: <span>Select Entry</span>
        </li>
      </ul>
    </div>
  );
}
