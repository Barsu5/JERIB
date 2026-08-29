import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  size?: "nav" | "hero";
  showTagline?: boolean;
  className?: string;
};

/** Pattern-filled JERIB wordmark from brand asset */
export function BrandMark({
  href = "/",
  size = "nav",
  showTagline = false,
  className = "",
}: BrandMarkProps) {
  const mark =
    size === "hero" ? (
      <Image
        src="/brand/jerib-logo-nobg.png"
        alt="JERIB"
        width={879}
        height={246}
        priority
        className={`h-auto w-[min(92vw,44rem)] ${className}`}
      />
    ) : (
      <Image
        src="/brand/jerib-logo-nobg.png"
        alt="JERIB"
        width={879}
        height={246}
        className={`h-8 w-auto sm:h-9 ${className}`}
      />
    );

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
