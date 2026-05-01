import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #fb7185 0%, #f472b6 50%, #fb923c 100%)",
          color: "white",
          fontSize: 360,
          fontWeight: 700,
          letterSpacing: -10,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 96,
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
