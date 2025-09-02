let accessToken = "";
const clientID = "c9c0e86df6c64b12b93e0f5264f18deb";
const redirectUrl = "https://geffjammmingproject.surge.sh";
const scope = "playlist-modify-public user-read-private user-read-email";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

// ===== Helpers =====
const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// ===== Spotify Object =====
const Spotify = {
  async getAccessToken() {
    const storedToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");

    if (storedToken && Date.now() < expiresAt) {
      accessToken = storedToken;
      return accessToken;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      return await this.fetchToken(code);
    }

    // inicia login PKCE
    const codeVerifier = generateRandomString(64);
    localStorage.setItem("code_verifier", codeVerifier);

    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.search = new URLSearchParams({
      response_type: "code",
      client_id: clientID,
      scope,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: redirectUrl,
    });

    window.location = authUrl.toString();
  },

  async fetchToken(code) {
    const code_verifier = localStorage.getItem("code_verifier");

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientID,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUrl,
        code_verifier,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      accessToken = data.access_token;
      const expiresAt = Date.now() + data.expires_in * 1000;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("expires_at", expiresAt);
      window.history.pushState({}, document.title, "/"); // limpa URL
      return accessToken;
    } else {
      console.error("Erro ao buscar token", data);
    }
  },

  async search(term) {
    const token = await this.getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
        term
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const json = await response.json();
    if (!json.tracks) return [];

    return json.tracks.items
      .filter((t) => t.preview_url) // só tracks com preview
      .map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artists[0].name,
        album: t.album.name,
        uri: t.uri,
        previewUrl: t.preview_url,
      }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    const token = await this.getAccessToken();
    const header = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const userResponse = await fetch("https://api.spotify.com/v1/me", { headers: header });
    const userId = (await userResponse.json()).id;

    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: header,
        body: JSON.stringify({ name }),
      }
    );

    const playlistId = (await playlistResponse.json()).id;

    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: header,
      body: JSON.stringify({ uris: trackUris }),
    });
  },
};

export default Spotify;
