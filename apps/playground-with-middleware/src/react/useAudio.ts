import { useCallback, useEffect, useRef, useState } from "react";

export function useAudio(url: string) {
  const audioRef = useRef<HTMLAudioElement>();
  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);

  useEffect(() => {
    /* Instead of using useState<HTMLAudioElement>(new Audio(url))
     * we do this because Gatsby is not building */
    const audio = new Audio();
    audio.muted = false;
    audioRef.current = audio;

    audio.src =
      "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
  }, [url]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume * 0.5;
  }, [volume]);

  const pausePlaying = useCallback(() => {
    setPlaying(false);
    try {
      audioRef.current?.pause();
    } catch (e) {
      console.error("Cannot pause audio", e);
    }
  }, [audioRef]);

  /**
   * Use Start Playing inside a click event
   * This will allow the audio file to be played from the browsers
   */
  const startPlaying = useCallback(() => {
    setPlaying(true);
    try {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (e) {
      console.error("Cannot play audio", e);
    }
  }, [url]);

  useEffect(() => {
    if (audioRef.current)
      audioRef.current.addEventListener("ended", pausePlaying);
    return () => {
      if (audioRef.current)
        audioRef.current.removeEventListener("ended", pausePlaying);
    };
  }, [audioRef, pausePlaying]);

  useEffect(() => {
    return () => {
      pausePlaying();
    };
  }, [pausePlaying]);

  return {
    playing,
    volume,
    setVolume,
    play: startPlaying,
    pause: pausePlaying,
  };
}
