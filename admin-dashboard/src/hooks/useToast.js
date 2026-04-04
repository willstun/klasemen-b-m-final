"use client";
import { useState, useCallback } from "react";

export function useToast(duration = 3000) {
  const [message, setMessage] = useState(null);

  const show = useCallback(
    (msg) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), duration);
    },
    [duration]
  );

  const Toast = message
    ? () => (
        <div className="fixed bottom-6 right-6 bg-toast-bg border border-toast-border text-white px-5 py-3 rounded-xl text-sm z-10000 toast-animate shadow-xl">
          {message}
        </div>
      )
    : () => null;

  return { show, Toast };
}
