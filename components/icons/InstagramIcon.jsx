// lucide-react no incluye logos de marca (a propósito: solo íconos
// genéricos). Este es el glyph de Instagram con el mismo trazo de línea y
// las mismas props (size/color/strokeWidth) que los íconos de lucide, para
// que combine sin desentonar donde aparece junto a ellos.
export default function InstagramIcon({ size = 20, color = "currentColor", strokeWidth = 1.8, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
