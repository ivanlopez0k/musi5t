import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const size = {
  width: 48,
  height: 48,
};
export const contentType = "image/png";

export default async function Icon() {
  const fontData = await fs.readFile(
    path.join(process.cwd(), "public", "fonts", "Inter-Black.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0E0E0E",
          borderRadius: 11,
          border: "1.5px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-0.05em",
          }}
        >
          <span
            style={{
              fontSize: 23,
              fontWeight: 900,
              fontFamily: '"Inter"',
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            m
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: '"Inter"',
              color: "#FFD83D",
              lineHeight: 1,
            }}
          >
            5
          </span>
          <span
            style={{
              fontSize: 23,
              fontWeight: 900,
              fontFamily: '"Inter"',
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            t
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          weight: 900,
          style: "normal",
        },
      ],
    }
  );
}
