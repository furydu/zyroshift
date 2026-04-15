"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type CryptoIconProps = {
  alt: string;
  className?: string;
  size: number;
  sources: string[];
};

export function CryptoIcon({
  alt,
  className = "",
  size,
  sources,
}: CryptoIconProps) {
  const [state, setState] = useState(() => ({
    signature: sources.join("|"),
    sourceIndex: 0,
  }));
  const sourceSignature = useMemo(() => sources.join("|"), [sources]);
  const effectiveSourceIndex =
    state.signature === sourceSignature ? state.sourceIndex : 0;
  const safeIndex = Math.min(
    effectiveSourceIndex,
    Math.max(sources.length - 1, 0),
  );
  const source = sources[safeIndex];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ height: size, width: size }}
    >
      <Image
        alt={alt}
        className="h-full w-full object-contain"
        height={size}
        onError={() => {
          setState((current) => {
            const currentIndex =
              current.signature === sourceSignature ? current.sourceIndex : 0;

            return {
              signature: sourceSignature,
              sourceIndex:
                currentIndex < sources.length - 1 ? currentIndex + 1 : currentIndex,
            };
          });
        }}
        src={source}
        unoptimized
        width={size}
      />
    </span>
  );
}
