"use client";

import Image from "next/image";
import { useState } from "react";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <div className={className} aria-label={alt} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={1200}
      height={1200}
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}
