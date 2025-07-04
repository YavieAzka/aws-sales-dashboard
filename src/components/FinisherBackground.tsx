"use client";
import { useEffect } from "react";

export default function FinisherBackground() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/js/finisher.js"; // Pastikan ini sesuai dengan file di public
    script.async = true;
    script.onload = () => {
      if (typeof window.FinisherHeader === "function") {
        new window.FinisherHeader({
          count: 12,
          size: {
            min: 887,
            max: 1500,
            pulse: 0,
          },
          speed: {
            x: {
              min: 1.0,
              max: 2,
            },
            y: {
              min: 1.0,
              max: 2,
            },
          },
          colors: {
            background: "#040d12",
            particles: ["#183d3d", "#0c0c0c"],
          },
          blending: "lighten",
          opacity: {
            center: 0.6,
            edge: 0,
          },
          skew: -2,
          shapes: ["c"],
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return null; // Tidak perlu render apa-apa
}
