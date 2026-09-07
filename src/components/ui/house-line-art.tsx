/**
 * Minimal, dependency-free line-art house — echoes the house outline in the
 * ClicMénage logo. Used as a low-opacity brand watermark/flourish in a
 * couple of places (never as a literal icon, never redrawing the logo
 * itself) so the brand identity shows up beyond the header/footer.
 */
export function HouseLineArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" className={className} aria-hidden="true">
      <path
        d="M70 210 L200 100 L330 210"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M100 185 V310 H300 V185" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" />
      <rect x="176" y="230" width="48" height="80" rx="3" stroke="currentColor" strokeWidth="10" />
      <rect x="128" y="220" width="38" height="38" rx="3" stroke="currentColor" strokeWidth="10" />
      <rect x="234" y="220" width="38" height="38" rx="3" stroke="currentColor" strokeWidth="10" />
    </svg>
  );
}
