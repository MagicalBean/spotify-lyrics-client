import { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';

export default function Player({
  accessToken,
  trackUri,
  quedTracks,
  setPlayingTrack,
}) {
  const [play, setPlay] = useState(false);
  // const [currentSong, setCurrentSong] = useState({});

  useEffect(() => {
    setPlay(true);
  }, [trackUri]);

  if (!accessToken) return null;
  return (
    <SpotifyPlayer
      initialVolume={0.1}
      token={accessToken}
      showSaveIcon
      callback={(state) => {
        if (!state.isPlaying) setPlay(false);
        if (state.type === 'track_update') {
          // Runs whenever the track (song) changes
          setPlayingTrack(state.track);
          console.log('Track Update: ', state.track);
        }
      }}
      play={play}
      uris={trackUri ? [trackUri, ...quedTracks] : []}
    />
  );
}
