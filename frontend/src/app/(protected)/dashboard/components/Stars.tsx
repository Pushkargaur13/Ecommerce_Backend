function Stars({ value = 0 }: { value?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f-${i}`} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.363 1.118l1.287 3.967c.3.922-.755 1.688-1.54 1.118l-3.376-2.455a1 1 0 00-1.176 0L5.21 17.95c-.784.57-1.838-.196-1.539-1.118l1.287-3.967a1 1 0 00-.363-1.118L1.218 8.26c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ))}
      {half ? (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <defs>
            <linearGradient id="half-grad-unique">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-grad-unique)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.363 1.118l1.287 3.967c.3.922-.755 1.688-1.54 1.118l-3.376-2.455a1 1 0 00-1.176 0L5.21 17.95c-.784.57-1.838-.196-1.539-1.118l1.287-3.967a1 1 0 00-.363-1.118L1.218 8.26c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ) : null}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e-${i}`} className="w-4 h-4 text-gray-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.376 2.455a1 1 0 00-.363 1.118l1.287 3.967c.3.922-.755 1.688-1.54 1.118l-3.376-2.455a1 1 0 00-1.176 0L5.21 17.95c-.784.57-1.838-.196-1.539-1.118l1.287-3.967a1 1 0 00-.363-1.118L1.218 8.26c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ))}
    </div>
  );
}

export default Stars