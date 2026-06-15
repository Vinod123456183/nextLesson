"use client";

import { useEffect, useState, useRef } from "react";

// Generates a random session ID persisted in sessionStorage
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "wb_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function ActiveUsers() {
  const [count, setCount] = useState<number | null>(null);
  const sessionId = useRef<string>("");

  useEffect(() => {
    sessionId.current = getSessionId();

    async function ping() {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
      } catch {}
    }

    async function fetchCount() {
      try {
        const res = await fetch("/api/presence");
        const data = await res.json();
        setCount(data.count ?? 0);
      } catch {}
    }

    // Ping immediately then every 30s
    ping();
    fetchCount();
    const pingInterval = setInterval(ping, 30_000);
    const countInterval = setInterval(fetchCount, 15_000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(countInterval);
    };
  }, []);

  if (count === null) return null;

  return (
    <div
      title="People active in the last 60 seconds"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs text-gray-500 shadow-sm select-none"
    >
      {/* Pulsing green dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="font-medium text-gray-700">{count}</span>
      <span>online</span>
    </div>
  );
}
