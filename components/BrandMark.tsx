import Image from "next/image";
import Link from "next/link";

type BrandSize = "nav" | "hero" | "inline" | "badge";

type BrandMarkProps = {
  /** Omit for home link; pass `null` for no link (inline logo). */
  href?: string | null;
  size?: BrandSize;
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
  href,
  size = "nav",
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

  if (href === null) return mark;

  return (
    <Link href={href ?? "/"} className="inline-flex focus:outline-none focus-visible:ring-1 focus-visible:ring-gold">
      {mark}
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
              <BrandMark href={null} size="inline" animated className="mx-0.5" />
            </>
          )}
        </span>
      ))}
    </span>
  );
}
