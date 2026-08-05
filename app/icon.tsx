import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Ícone do app: o broto da marca, em bone sobre o verde profundo. */
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
          background: "#0d3a2d",
          borderRadius: 112,
        }}
      >
        <svg width="300" height="300" viewBox="0 0 24 24" fill="none">
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
