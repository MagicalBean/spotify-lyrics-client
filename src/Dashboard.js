import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { Container, Form } from 'react-bootstrap';
import SpotifyWebApi from 'spotify-web-api-node';
import TrackSearchResult from './TrackSearchResult';
import Player from './Player';
import axios from 'axios';
import Playlist from './Playlist';

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const spotifyApi = new SpotifyWebApi({
  clientId: 'ee3921ca0b7c4de694b2b18925a5f5e1',
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [quedTracks, setQuedTracks] = useState([]);
  const [lyrics, setLyrics] = useState('');

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch('');
    setLyrics('');
  }

  function choosePlaylist(playlist) {
    spotifyApi
      .getPlaylistTracks(playlist.tracks.split('/')[5], 'US')
      .then((res) => {
        setQuedTracks(res.body.items.slice(1).map((item) => item.track)); // Set the qued tracks to all but the first tracks of the playlist
        setPlayingTrack(res.body.items[0].track); // Set the first track to be the active one
        setSearch('');
        setLyrics('');
      })
      .catch((err) => console.log(err));
  }

  function handleBack() {
    setSearch('');
    setLyrics('');
  }

  //* Fetch/Show Lyrics
  useEffect(() => {
    if (!playingTrack) return;

    let title = playingTrack?.title ? playingTrack?.title : playingTrack?.name;

    let artist = GetArtist(playingTrack);

    console.log('Title: ' + title + ', Artist: ' + artist);

    axios
      .get('https://spotify-lyrics-server.herokuapp.com/lyrics', {
        params: { track: title, artist: artist },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  //* Function to get the artist, because each data structures it differently
  const GetArtist = (track) => {
    if (track?.artist) return track.artist;
    if (Array.isArray(track.artists)) return track.artists[0].name; //TODO: Return all the artists, not just the first one
    return track.artists;
  };

  //* Update Access Token
  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  //* Get the authenticated user's playlists
  useEffect(() => {
    spotifyApi
      .getUserPlaylists()
      .then((res) => {
        setUserPlaylists(
          res.body.items.map((playlist) => {
            const smallestPlaylistImage = playlist.images.reduce(
              (smallest, image) => {
                if (image.height < smallest.height) return image;
                else return smallest;
              },
              playlist.images[0]
            );

            return {
              name: playlist.name,
              description: playlist.description,
              owner: playlist.owner.display_name,
              imageUrl: smallestPlaylistImage?.url,
              uri: playlist.uri,
              tracks: playlist.tracks.href,
            };
          })
        );
      })
      .catch((err) => console.log(err));
  }, [accessToken]);

  //* Search Query
  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              else return smallest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage?.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: '100vh' }}>
      <div className="d-flex flex-row">
        {lyrics && (
          <FontAwesomeIcon
            style={{ marginTop: 3, cursor: 'pointer' }}
            className="mr-3"
            icon={faArrowLeft}
            size="2x"
            onClick={handleBack}
          />
        )}
        <Form.Control
          type="search"
          placeholder="Search Songs/Artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-grow-1 my-2" style={{ overflowY: 'auto' }}>
        {searchResults.length !== 0 ? (
          searchResults.map((track) => (
            <TrackSearchResult
              track={track}
              key={track.uri}
              chooseTrack={chooseTrack}
            />
          ))
        ) : searchResults.length === 0 && lyrics ? (
          <div className="text-center" style={{ whiteSpace: 'pre' }}>
            {lyrics}
          </div>
        ) : (
          userPlaylists.map((playlist) => (
            <Playlist
              playlist={playlist}
              choosePlaylist={choosePlaylist}
              key={playlist.uri}
            />
          ))
        )}
      </div>
      <div>
        <Player
          accessToken={accessToken}
          trackUri={
            playingTrack?.tracks ? playingTrack?.tracks : playingTrack?.uri
          }
          quedTracks={quedTracks.map((track) => track.uri)}
          setPlayingTrack={setPlayingTrack}
        />
      </div>
    </Container>
  );
}
