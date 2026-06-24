"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type WebLLMStatus,
  checkWebGPUSupport,
  generateCoachReplyWithWebLLM,
  loadWebLLMEngine,
  resetWebLLMEngine,
} from "@/lib/web-llm-coach";

export function useWebLLM(active: boolean) {
  const [status, setStatus] = useState<WebLLMStatus>("checking");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const supportedRef = useRef(false);
  const statusRef = useRef<WebLLMStatus>("checking");
  const checkPromiseRef = useRef<Promise<void> | null>(null);

  const setStatusSafe = useCallback((next: WebLLMStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  useEffect(() => {
    if (!active) return;
    if (checkPromiseRef.current) return;

    checkPromiseRef.current = checkWebGPUSupport().then((ok) => {
      supportedRef.current = ok;
      if (ok) {
        setStatusSafe("idle");
      } else {
        setStatusSafe("unsupported");
        setError("WebGPU not available. Use Chrome or Edge for browser AI.");
      }
    });

    return () => {
      checkPromiseRef.current = null;
    };
  }, [active, setStatusSafe]);

  const loadModel = useCallback(async () => {
    if (checkPromiseRef.current) {
      await checkPromiseRef.current;
    }
    if (!supportedRef.current) {
      setStatusSafe("unsupported");
      return;
    }
    if (statusRef.current === "ready") return;

    if (loadPromiseRef.current) {
      await loadPromiseRef.current;
      return;
    }

    if (statusRef.current === "error") {
      resetWebLLMEngine();
    }

    const loadTask = (async () => {
      setStatusSafe("loading");
      setError(null);
      setProgress(0);
      setProgressText("Starting…");

      try {
        await loadWebLLMEngine((p, text) => {
          setProgress(Math.round(p * 100));
          setProgressText(text);
        });
        setStatusSafe("ready");
        setProgress(100);
        setProgressText("");
      } catch (err) {
        resetWebLLMEngine();
        setStatusSafe("error");
        setError(err instanceof Error ? err.message : "Failed to load browser AI model");
        throw err;
      } finally {
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = loadTask;
    await loadTask;
  }, [setStatusSafe]);

  const ensureReady = useCallback(async (): Promise<boolean> => {
    if (checkPromiseRef.current) {
      await checkPromiseRef.current;
    }
    if (!supportedRef.current) return false;
    if (statusRef.current === "ready") return true;
    try {
      await loadModel();
      return true;
    } catch {
      return false;
    }
  }, [loadModel]);

  return {
    status,
    progress,
    progressText,
    error,
    loadModel,
    ensureReady,
    generateCoachReplyWithWebLLM,
    isSupported: status !== "unsupported" && status !== "checking",
    isChecking: status === "checking",
  };
}
