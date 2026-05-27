const VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-400',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-300',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-400',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      )}
      {children}
    </button>
  );
}
