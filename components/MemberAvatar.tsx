export default function MemberAvatar({
  seed,
  name,
  size = 32,
  className = "",
}: {
  seed: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const s = encodeURIComponent(seed || name || "?");
  const src = `https://api.dicebear.com/7.x/shapes/svg?seed=${s}&backgroundColor=1c2027&shape1Color=ff6b35&shape2Color=3b82f6&shape3Color=2dd4bf`;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-surface2 ring-1 ring-line ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
