"use client";

import { useEffect, useState } from "react";

export function useLiveNow(enabled = true, intervalMs = 1000) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const update = () => {
      setNow(Date.now());
    };

    const initialTimer = window.setTimeout(update, 0);
    const intervalTimer = window.setInterval(update, intervalMs);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalTimer);
    };
  }, [enabled, intervalMs]);

  return now;
}
