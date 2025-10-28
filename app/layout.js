"use client";

useEffect(() => {
  window.addEventListener("error", (event) => {
    alert("Error: " + event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    alert("Promise Error: " + event.reason);
  });
}, []);
