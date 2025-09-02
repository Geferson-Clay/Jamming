import React, { useState } from "react";
import styles from "./App.module.css";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import Spotify from "../util/Spotify/Spotify";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("Nova Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Adiciona track na playlist
  function addTrack(track) {
    if (!playlistTracks.find((t) => t.id === track.id)) {
      setPlaylistTracks([...playlistTracks, track]);
    }
  }

  // Remove track da playlist
  function removeTrack(track) {
    setPlaylistTracks(playlistTracks.filter((t) => t.id !== track.id));
  }

  // Atualiza nome da playlist
  function updatePlaylistName(name) {
    setPlaylistName(name);
  }

  // Salva playlist no Spotify
  async function savePlaylist() {
    const trackURIs = playlistTracks.map((t) => t.uri);
    await Spotify.savePlaylist(playlistName, trackURIs);
    setPlaylistName("Nova Playlist");
    setPlaylistTracks([]);
  }

  // Busca músicas
  async function search(term) {
    setSearchTerm(term);
    setLoading(true);
    const results = await Spotify.search(term);
    setSearchResults(results);
    setLoading(false);
  }

  return (
    <div className={styles.App}>
      <h1>
        Ja<span className={styles.highlight}>mmm</span>ing
      </h1>
      <SearchBar onSearch={search} />

      {loading && <p className={styles.loading}>Carregando...</p>}

      <div className={styles["App-playlist"]}>
        <SearchResults
          userSearchResults={searchResults}
          onAdd={addTrack}
          playlistTracks={playlistTracks}
        />
        <Playlist
          playlistName={playlistName}
          playlistTracks={playlistTracks}
          onRemove={removeTrack}
          onNameChange={updatePlaylistName}
          onSave={savePlaylist}
        />
      </div>
    </div>
  );
}

export default App;
