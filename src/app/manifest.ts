import type { MetadataRoute } from "next";

// Lets parents add the app to the phone home screen ("Install app" / "Add to Home Screen").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kali Kannada – Kannada, with confidence",
    short_name: "Kali Kannada",
    description: "Send photos of handwritten Kannada worksheets for marking.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/brand/kali-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/kali-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
