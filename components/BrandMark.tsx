import Image from "next/image";
import Link from "next/link";

type BrandSize = "nav" | "hero" | "inline" | "badge";

type BrandMarkProps = {
  href?: string;
  size?: BrandSize;
  showTagline?: boolean;
  animated?: boolean;
  className?: string;
};

const SIZE_CLASS: Record<BrandSize, string> = {
  nav: "h-8 w-auto sm:h-9",
  hero: "h-auto w-[min(92vw,44rem)]",
  inline: "inline-block h-[0.92em] w-auto align-[-0.12em]",
  badge: "h-full w-full object-contain object-center",
};

/** Pattern-filled JIRIB wordmark from brand asset */
export function BrandMark({
  href = "/",
  size = "nav",
  showTagline = false,
  animated = false,
  className = "",
}: BrandMarkProps) {
  const imgClass = `${SIZE_CLASS[size]} ${className}`.trim();
  const wrapClass = animated ? "brand-logo-animate inline-block" : "inline-block";

  const image = (
    <Image
      src="/brand/jerib-logo-nobg.png"
      alt="JIRIB"
      width={879}
      height={246}
      priority={size === "hero" || size === "nav"}
      className={imgClass}
    />
  );

  const mark = <span className={wrapClass}>{image}</span>;

  if (!showTagline && !href) return mark;

  const inner = (
    <span className="inline-flex flex-col items-start gap-2">
      {mark}
      {showTagline && <span className="text-heritage">Pamir heritage wear</span>}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-1 focus-visible:ring-gold">
      {inner}
    </Link>
  );
}

/** Replace standalone "JIRIB" tokens in copy with the animated logo. */
export function BrandInText({ text, className = "" }: { text: string; className?: string }) {
  if (!text.includes("JIRIB")) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split("JIRIB");
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              <BrandMark href={undefined} size="inline" animated className="mx-0.5" />
            </>
          )}
        </span>
      ))}
    </span>
  );
}
