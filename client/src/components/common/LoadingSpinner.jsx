export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6" role="status">
      <span
        aria-hidden="true"
        className={`${sizes[size] || sizes.md} rounded-full border-indigo-500 border-t-transparent animate-spin`}
      />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );
}
