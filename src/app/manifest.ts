import type { MetadataRoute } from "next";

// Lets parents add the app to the phone home screen ("Install app" / "Add to Home Screen").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nudi – Kannada, with confidence",
    short_name: "Nudi",
    description: "Send photos of handwritten Kannada worksheets for marking.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/brand/nudi-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/nudi-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
