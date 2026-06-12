import { useCallback, useEffect, useRef, useState } from "react";

type UseVoiceRecorderResult = {
  error: string | null;
  isPreparing: boolean;
  isRecording: boolean;
  reset: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopResolverRef = useRef<{
    reject: (reason?: unknown) => void;
    resolve: (value: Blob) => void;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const cleanup = useCallback(() => {
    stopResolverRef.current = null;
    mediaRecorderRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    chunksRef.current = [];
    setIsPreparing(false);
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    cleanup();
    setError(null);
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
      const nextError = "Voice recording is not supported in this browser.";
      setError(nextError);
      throw new Error(nextError);
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const nextError = "Microphone access is not available in this browser.";
      setError(nextError);
      throw new Error(nextError);
    }

    setError(null);
    setIsPreparing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];
      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        const nextError = "Recording failed. Please try again.";
        setError(nextError);
        stopResolverRef.current?.reject(new Error(nextError));
        cleanup();
      };

      mediaRecorder.onstop = () => {
        const mimeType =
          chunksRef.current[0]?.type || mediaRecorder.mimeType || "audio/webm";

        if (chunksRef.current.length === 0) {
          stopResolverRef.current?.reject(
            new Error("No audio was captured. Please try again."),
          );
          cleanup();
          return;
        }

        stopResolverRef.current?.resolve(
          new Blob(chunksRef.current, { type: mimeType }),
        );
        cleanup();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (recorderError) {
      cleanup();

      const nextError =
        recorderError instanceof Error
          ? recorderError.message
          : "Unable to access your microphone.";

      setError(nextError);
      throw recorderError;
    } finally {
      setIsPreparing(false);
    }
  }, [cleanup]);

  const stopRecording = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current;

    if (!mediaRecorder || mediaRecorder.state !== "recording") {
      throw new Error("Recording is not active.");
    }

    return await new Promise<Blob>((resolve, reject) => {
      stopResolverRef.current = { resolve, reject };
      mediaRecorder.stop();
      setIsRecording(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      stopStream(streamRef.current);
    };
  }, []);

  return {
    error,
    isPreparing,
    isRecording,
    reset,
    startRecording,
    stopRecording,
  };
}
