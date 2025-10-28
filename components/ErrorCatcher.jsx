"use client";
import { useEffect } from "react";

export default function ErrorCatcher({ children }) {
  useEffect(() => {
    // 🧨 Catch normal runtime errors
    const handleError = (event) => {
      console.error("🔥 Caught Error:", event.error || event.message);
      alert("⚠️ Error: " + (event.error?.message || event.message));
    };

    // ⚡ Catch promise rejections
    const handleRejection = (event) => {
      console.error("🔥 Unhandled Promise Rejection:", event.reason);
      alert("⚠️ Promise Error: " + (event.reason?.message || event.reason));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return children;
}
