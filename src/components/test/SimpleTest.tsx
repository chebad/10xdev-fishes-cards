import { useState, useEffect } from "react";

export default function SimpleTest() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid green",
        borderRadius: "8px",
        backgroundColor: "#f0f9ff",
      }}
    >
      <h2 style={{ color: "green", marginBottom: "10px" }}>✅ React Component Works!</h2>
      <p>This is a simple test component to verify React is working.</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Clicked {count} times
      </button>
      <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
        If you can see this and the button works, React is loaded correctly.
      </div>
    </div>
  );
}
