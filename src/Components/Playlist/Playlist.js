import React from "react";
import Track from "../Track/Track";
import styles from "./Playlist.module.css";

function Playlist({ playlistName, playlistTracks, onRemove, onNameChange, onSave }) {
  function handleNameChange(e) {
    onNameChange(e.target.value);
  }

  return (
    <div className={styles.Playlist}>
      <input value={playlistName} onChange={handleNameChange} />

      {/* Lista de tracks */}
      {playlistTracks.length > 0 ? (
        playlistTracks.map((track) => (
          <Track
            key={track.id}
            track={track}
            onRemove={onRemove}
            isRemoval={true}
          />
        ))
      ) : (
        <p>Nenhuma música na playlist</p>
      )}

      <button className={styles["Playlist-save"]} onClick={onSave}>
        SALVAR NA SPOTIFY
      </button>
    </div>
  );
}

export default Playlist;
