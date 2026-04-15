"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [sourceIndex, setSourceIndex] = useState(0);
  const safeIndex = Math.min(sourceIndex, Math.max(sources.length - 1, 0));
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
          setSourceIndex((current) =>
            current < sources.length - 1 ? current + 1 : current,
          );
        }}
        src={source}
        unoptimized
        width={size}
      />
    </span>
  );
}
