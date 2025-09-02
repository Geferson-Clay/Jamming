import React, { useState, useRef } from "react";
import styles from "./Track.module.css";

function Track({ track, onAdd, onRemove, isRemoval }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  }

  function addTrack() {
    onAdd(track);
  }

  function removeTrack() {
    onRemove(track);
  }

  return (
    <div className={styles.Track}>
      <div className={styles["Track-information"]}>
        <h3>{track.name}</h3>
        <p>{track.artist} | {track.album}</p>

        {track.previewUrl ? (
  <div className={styles["Track-player"]}>
    <button onClick={togglePlay}>
      {isPlaying ? "⏸️ Pause" : "▶️ Play"}
    </button>
    <audio
      ref={audioRef}
      src={track.previewUrl}
      onEnded={() => setIsPlaying(false)}
    />
  </div>
) : (
  <p className={styles["no-preview"]}>Sem prévia disponível</p>
)}

            
      </div>

      {isRemoval ? (
        <button className={styles["Track-action"]} onClick={removeTrack}>
          -
        </button>
      ) : (
        <button className={styles["Track-action"]} onClick={addTrack}>
          +
        </button>
      )}
    </div>
  );
}

export default Track;
