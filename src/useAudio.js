import { useMemo, useEffect, useState } from 'react';
// import rain from 'assets/audio/rain.mp3'; --> hardcoded import I've tried

const useAudio = (url) => {
  const audio = useMemo(() => new Audio(url), [url]);
  const [playing, setPlaying] = useState(true);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    audio.loop = false;
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, [audio]);

  return [playing, toggle];
};

export default useAudio;