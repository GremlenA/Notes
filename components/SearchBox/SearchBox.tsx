"use client";

import css from "./SearchBox.module.css";

interface SearchBoxProps {
  value: string | undefined;
  onChange: (v: string) => void;
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <input
      className={css.input}
      type="text"
      placeholder="Search notes"
      value={value ?? ""} 
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search notes"
    />
  );
}
