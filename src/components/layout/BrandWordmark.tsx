import Image from "next/image";

export function BrandWordmark({
  textClassName,
  iconClassName,
}: {
  textClassName?: string;
  iconClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/zyroshift-dog-only-blink-loop.svg"
        alt=""
        width={24}
        height={24}
        aria-hidden="true"
        className={iconClassName || "h-5 w-5 shrink-0"}
        unoptimized
      />
      <span
        className={
          textClassName ||
          "theme-text-main font-mono text-sm uppercase tracking-[0.36em]"
        }
      >
        ZyroShift
      </span>
    </span>
  );
}
