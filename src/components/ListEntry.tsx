import { NS } from '@src/data/constants';
import { useQueryStore } from '@src/store';
import { Ref, RefObject, useEffect, useRef } from 'react';
import { ListNavEntry } from '../navigationParser';

const favorited = `${NS}-favorited`;

export function ListEntry({
  parent,
  active,
  index,
  item,
  onClick,
  onSelect,
}: {
  parent: RefObject<HTMLUListElement>;
  item: ListNavEntry;
  active: boolean;
  index: number;
  onSelect: () => void;
  onClick: () => void;
}) {
  const self = useRef<HTMLLIElement>(null);
  const setFavorite = useQueryStore((state) => state.setFavorite);
  const isFavorite = useQueryStore((state) => state.isFavorite(item.href));

  useEffect(() => {
    if (active) {
      self.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [active]);

  return (
    <li
      ref={self}
      tabIndex={1}
      onFocus={onSelect}
      className={`${NS}-list-entry ${active ? 'active' : ''}`}
      title={`${item.label}`}
    >
      <div
        className={`${NS}-favorite ${isFavorite ? favorited : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setFavorite(item.href);
        }}
      >
        {isFavorite ? '★' : '☆'}
      </div>
      <div onClick={onClick} className={`${NS}-label--wrapper`}>
        <span className={`${NS}-label`}>{item.label}</span>
        <span className={`${NS}-description`}>{item.description}</span>
      </div>
      <span
        className={`${NS}-shortcut`}
        title={`press ${index + 1} to navigate to ${item.description}/${
          item.label
        }`}
      >
        {index < 9 ? index + 1 : <>&nbsp;</>}
      </span>
    </li>
  );
}
