"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  alt,
  accent,
}: {
  images: string[];
  alt: string;
  accent: string;
}) {
  const gallery = images.length ? images : [];
  const [active, setActive] = useState(gallery[0] ?? "");

  if (!active) return null;

  return (
    <div>
      <div
        className="product-detail__media"
        style={{ backgroundColor: accent }}
      >
        <Image
          src={active}
          alt={alt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 55vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      {gallery.length > 1 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: "0.5rem",
            marginTop: "0.75rem",
          }}
        >
          {gallery.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              aria-label="Bild auswählen"
              style={{
                position: "relative",
                aspectRatio: "1",
                overflow: "hidden",
                background: accent,
                border: src === active ? "2px solid #17417D" : "2px solid transparent",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
