import { Note } from '@/types/note';
import Link from 'next/link';
import React from 'react';

interface NoteItemProps {
  item: Note;
}

const NoteItem = ({ item }: NoteItemProps) => {
  return (
    <li>
      <Link href={`/notes/${item.id}`}>{item.title}</Link>
    </li>
  );
};

export default NoteItem;
