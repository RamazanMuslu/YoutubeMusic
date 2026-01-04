window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

const { ipcRenderer } = window.nodeRequire("electron");

function checkMusic() {
  if (window.location.hostname !== "music.youtube.com") return;

  const playerBar = document.querySelector("ytmusic-player-bar");
  if (!playerBar) return;

  const titleElement = playerBar.querySelector(".title");
  const artistElement = playerBar.querySelector(".byline");
  const thumbnailElement = playerBar.querySelector(".thumbnail img");


  if (titleElement && artistElement) {
    const title = titleElement.getAttribute("title") || titleElement.textContent?.trim();
    // Artist text might contain " • Album • Year". We usually just want the first part.
    // simpler: just take the text content which usually lists artists.
    // Or iterate over 'a' tags inside byline.

    // YTM structure: <div class="byline"> <a>Artist</a> <span>•</span> <a>Album</a> ... </div>
    // Let's grab all text for now or just the first anchor.
    let artist = '';
    const artistLinks = artistElement.querySelectorAll('a');
    if (artistLinks.length > 0) {
      artist = artistLinks[0].textContent;
    } else {
      artist = artistElement.textContent?.trim() || "";
    }

    // Filter out "Video" or unnecessary separators if raw text is used
    // But getting the first link is usually a safe bet for the main artist.

    let thumbnail = '';
    if (thumbnailElement) {
      thumbnail = thumbnailElement.src;
    }

    const data = {
      details: title,
      state: artist,
      largeImageKey: thumbnail,
    };

    // Only update if changed? IPC might handle throttling, but good practice to limit spam.
    // For now, let's just send it. The main process can handle diffing if needed or we can state management here.
    ipcRenderer.send("discord-rpc", data);
  }
}

// Observe changes or poll? Polling is easier and robust for YTM's DOM changes.
setInterval(checkMusic, 5000); // Check every 5 seconds

// Handle page load
window.addEventListener('DOMContentLoaded', () => {
  // Inject CSS for better desktop experience if needed
});
