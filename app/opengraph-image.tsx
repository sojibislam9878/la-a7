import { ImageResponse } from "next/og"

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const alt = `${SITE_NAME}: cold storage booking for Bangladeshi farmers`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BARS = [42, 48, 30, 78, 86, 82, 46, 50]

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#14361f",
          color: "#f6f1e4",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#f4b13e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: "#14361f",
              }}
            >
              ❄
            </div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
              Agro<span style={{ color: "#f4b13e" }}>Store</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
              <span>Grow more.</span>
              <span style={{ color: "#f4b13e" }}>Waste less.</span>
            </div>
            <div style={{ display: "flex", fontSize: 30, color: "rgba(246, 241, 228, 0.8)", maxWidth: 620 }}>
              {SITE_DESCRIPTION}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, paddingLeft: 40 }}>
          {BARS.map((height, index) => (
            <div
              key={index}
              style={{
                width: 34,
                height: height * 4.4,
                borderRadius: 8,
                background: index >= 3 && index <= 5 ? "#4ade80" : "rgba(74, 222, 128, 0.35)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    size
  )
}
