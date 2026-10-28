import { useState } from "react";
export default function StackIcon({
  name,
  variant = "dark",
  className = "",
  style,
}: {
  name: string;
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !/^[a-z0-9-]+$/i.test(name))
    return (
      <span className={className} style={style} aria-hidden="true">
        ⌘
      </span>
    );
  return (
    <img
      src={`/assets/stack/${name}-${variant}.svg`}
      alt=""
      aria-hidden="true"
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      width="24"
      height="24"
      onError={() => setFailed(true)}
    />
  );
}
