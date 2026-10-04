"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Cierre con animación para los popups: `close()` marca `closing` (el popup
// cambia a su animación de salida, gsmBackOut/gsmPopOut en globals.css) y
// recién después de CLOSE_MS llama al onClose real, que lo desmonta. Antes
// los popups entraban animados pero desaparecían de golpe.
export const CLOSE_MS = 180;

export const BACKDROP_OUT = `gsmBackOut ${CLOSE_MS}ms ease-out both`;
export const CARD_OUT = `gsmPopOut ${CLOSE_MS}ms cubic-bezier(0.22,0.61,0.36,1) both`;

export function useClosing(onClose) {
  const [closing, setClosing] = useState(false);
  const timer = useRef(null);

  const close = useCallback(() => {
    if (timer.current) return; // ya se está cerrando
    setClosing(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setClosing(false);
      onClose();
    }, CLOSE_MS);
  }, [onClose]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [closing, close];
}
