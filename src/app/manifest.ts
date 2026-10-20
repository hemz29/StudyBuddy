import type { MetadataRoute } from "next";

// Lets parents add the app to the phone home screen ("Install app" / "Add to Home Screen").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudyBuddy Kannada",
    short_name: "StudyBuddy",
    description: "Send photos of handwritten Kannada worksheets for marking.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#4f5bd5",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
