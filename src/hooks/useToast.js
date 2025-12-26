import { useCallback, useState } from "react";

// Lightweight helper to manage toast success + error queues
export default function useToast({ maxErrors = 3 } = {}) {
  const [toastErrors, setToastErrors] = useState([]);
  const [toastSuccess, setToastSuccess] = useState("");

  const pushError = useCallback(
    (message) => {
      if (!message) return;
      setToastErrors((prev) => [...prev, String(message)].slice(-maxErrors));
    },
    [maxErrors]
  );

  const showSuccess = useCallback((message) => {
    setToastSuccess(message || "");
  }, []);

  const clearErrorAt = useCallback((index) => {
    setToastErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearErrors = useCallback(() => setToastErrors([]), []);
  const clearSuccess = useCallback(() => setToastSuccess(""), []);

  return {
    toastErrors,
    toastSuccess,
    pushError,
    showSuccess,
    clearErrorAt,
    clearErrors,
    clearSuccess,
    setToastErrors,
    setToastSuccess,
  };
}
