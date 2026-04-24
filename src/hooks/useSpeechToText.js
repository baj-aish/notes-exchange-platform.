import { useEffect, useMemo, useState } from "react";

export const useSpeechToText = () => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognition = useMemo(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.lang = "en-IN";
    instance.interimResults = true;
    instance.continuous = true;
    return instance;
  }, []);

  useEffect(() => {
    if (!recognition) return;
    setSupported(true);

    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscript(spokenText);
    };

    recognition.onend = () => setListening(false);
  }, [recognition]);

  const startListening = () => {
    if (!recognition) return;
    setTranscript("");
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (!recognition) return;
    recognition.stop();
    setListening(false);
  };

  return {
    listening,
    supported,
    transcript,
    startListening,
    stopListening
  };
};
