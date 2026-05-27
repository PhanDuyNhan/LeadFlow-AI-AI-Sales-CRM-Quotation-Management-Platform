import { useEffect, useRef, useState } from 'react';

export default function SearchInput({
  value: controlled,
  defaultValue = '',
  placeholder = 'Search…',
  onSearch,
  delay = 300,
  className = '',
}) {
  const [value, setValue] = useState(controlled ?? defaultValue);
  const timerRef = useRef(null);
  const isControlled = controlled !== undefined;

  useEffect(() => {
    if (isControlled) setValue(controlled);
  }, [controlled, isControlled]);

  function handleChange(e) {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch?.(next);
    }, delay);
  }

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return (
    <input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
    />
  );
}
