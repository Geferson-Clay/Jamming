import React from "react";
import Track from "../Track/Track";
import styles from "./SearchResults.module.css";

function SearchResults({ userSearchResults, onAdd, playlistTracks }) {
  // Filtra músicas sem preview ou já presentes na playlist
  const filteredTracks = userSearchResults.filter(
    (track) =>
      track.previewUrl && !playlistTracks.some((t) => t.id === track.id)
  );

  return (
    <div className={styles["SearchResults"]}>
      <h2>Resultados da Busca</h2>
      {filteredTracks.map((track) => (
        <Track
          key={track.id}
          track={track}
          onAdd={onAdd}
          isRemoval={false}
        />
      ))}
      {filteredTracks.length === 0 && <p>Nenhuma faixa disponível para prévia.</p>}
    </div>
  );
}

export default SearchResults;
