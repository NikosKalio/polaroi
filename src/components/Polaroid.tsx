interface PolaroidProps {
  url: string;
  userName: string;
  timestamp: number;
  rotation?: number;
  style?: React.CSSProperties;
  className?: string;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Polaroid({
  url,
  userName,
  timestamp,
  rotation = 0,
  style,
  className = "",
}: PolaroidProps) {
  return (
    <div
      className={`bg-white p-2 pb-10 polaroid-shadow transition-all duration-500 hover:scale-105 hover:z-10 cursor-default ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        width: "180px",
        ...style,
      }}
    >
      <img
        src={url}
        alt={`Photo by ${userName}`}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />
      <div className="pt-1.5 text-center">
        <p
          className="text-ink text-base leading-tight"
          style={{ fontFamily: "var(--font-hand)", fontWeight: 600 }}
        >
          {userName}
        </p>
        <p
          className="text-stone text-[10px] mt-0.5"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300, letterSpacing: "0.05em" }}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
