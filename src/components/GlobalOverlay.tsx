import { NS, suffixes } from '@src/data/constants';
import { ReactNode, useEffect } from 'react';

const overview: Array<{ tooltip: string; title: string; label: string }> = [
  {
    tooltip: 'command or control + shift + p toggles window visibility',
    title: '⌘+⇧+p',
    label: 'Open/Close the menu',
  },
  {
    tooltip: 'Press Escape to close the window',
    title: 'Escape',
    label: 'Close the menu',
  },
  {
    tooltip: 'Press Enter to open the selected item',
    title: 'Enter',
    label: 'Open the selected item',
  },
  {
    tooltip: 'Press 1 through 9 to select that entry in the list',
    title: '1-9',
    label: 'Select menu entry',
  },
  {
    tooltip: 'Entry will appear first in search results, click to toggle',
    title: '★/☆',
    label: 'Favorited entry, appears first in search',
  },
  {
    tooltip: 'Switch to another portal',
    title: suffixes['portal'],
    label: 'A Portal, selecting it will switch to that portal',
  },
  {
    tooltip: 'Navigate to a page',
    title: suffixes['nav'],
    label: 'Primary nav item, navigate to that page',
  },
  {
    tooltip: 'Navigate to a setting page',
    title: suffixes['settings'],
    label: 'Settings item, navigate to that page',
  },
  {
    tooltip: 'Navigate to account setting page',
    title: suffixes['account'],
    label: 'Account Setting item, navigate to page',
  },
  {
    tooltip: 'Perform an action, such as creating CRM objects',
    title: suffixes['action'],
    label: 'Perform common actions such as creating CRM objects',
  },
];

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
        fontSize: '.8rem',
      }}
      onClick={onClick}
    >
      <ul className={`${NS}-guide`}>
        {overview.map(({ tooltip, title, label }) => (
          <li title={tooltip}>
            <strong>{title}</strong>: <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
