import React from 'react';

export default function Playlist({ playlist, choosePlaylist }) {
  function handleClick() {
    choosePlaylist(playlist);
  }

  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
    >
      <a href={playlist.uri}>
        <img
          src={playlist.imageUrl}
          style={{ height: '74px', width: '74px' }}
          alt={playlist.name}
        />
      </a>
      <div className="ml-3">
        <div>{playlist.name}</div>
        <div className="text-muted">{playlist.description}</div>
        <div className="d-flex flex-row">
          <div className="text-muted">{'Created by'}</div>
          &nbsp;
          <div>{playlist.owner}</div>
        </div>
      </div>
    </div>
  );
}
