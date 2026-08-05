import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d3a2d",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none">
          <path d="M12 21V10.5" stroke="#fbf7f2" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M12 13.2c0-3.4 2.3-6.1 6-6.7.3 3.9-2.1 6.7-6 6.7Z" fill="#fbf7f2" />
          <path
            d="M12 16.4c-3.2 0-5.2-2.3-5.1-5.6 3.1.5 5.1 2.8 5.1 5.6Z"
            fill="#fbf7f2"
            fillOpacity="0.6"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
