console.log("Let's write JavaScript");

let currentSong = "";
let currFolder;
let songs;
let audio;
let songMetadata = {}; // To hold artist data for current folder

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

async function getSongs(folder) {
  currFolder = folder;

  // Fetch metadata.json
  try {
    const metaRes = await fetch(`/spotify_clone/${currFolder}/metadata.json`);
    songMetadata = await metaRes.json();
  } catch (err) {
    console.error("Metadata fetch failed", err);
    songMetadata = {};
  }

  const a = await fetch(`/spotify_clone/${currFolder}/`);
  const response = await a.text();
  const div = document.createElement("div");
  div.innerHTML = response;

  const as = div.getElementsByTagName("a");
  const songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      const fileName = element.href.split(`/${currFolder}/`)[1];
      songs.push(fileName);
    }
  }
  return songs;
}

const playMusic = (track) => {
  if (audio) audio.pause();
  currentSong = track;
  audio = new Audio(`/spotify_clone/${currFolder}/` + track);

  audio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      audio.currentTime
    )} / ${formatTime(audio.duration)}`;
    document.querySelector(".circle").style.left =
      (audio.currentTime / audio.duration) * 100 + "%";
  });

  audio.play();
  play.src = "pause.svg";
  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
  songs = await getSongs("songs/HotHits");

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    const artist = songMetadata[song] || "Unknown Artist";
    songUL.innerHTML += `
      <li data-song="${song}">
        <img class="invert" src="music.svg" alt="" />
        <div class="info">
          <div>${decodeURIComponent(song).replace(".mp3", "")}</div>
          <div>${artist}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="" />
        </div>
      </li>`;
  }

  document.querySelectorAll(".songList li").forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.getAttribute("data-song"));
    });
  });

  play.addEventListener("click", () => {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      play.src = "pause.svg";
    } else {
      audio.pause();
      play.src = "play.svg";
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    if (!audio || !audio.duration) return;
    const seekbar = e.target.getBoundingClientRect();
    const clickFraction = (e.clientX - seekbar.left) / seekbar.width;
    audio.currentTime = clickFraction * audio.duration;
    document.querySelector(".circle").style.left = `${clickFraction * 100}%`;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(audio.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) playMusic(songs[index - 1]);
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(audio.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) playMusic(songs[index + 1]);
  });

  document.querySelector(".range input").addEventListener("input", (e) => {
    if (audio) audio.volume = e.target.value / 100;
  });

  document.querySelectorAll(".card").forEach((e) => {
    e.addEventListener("click", async () => {
      const folder = `songs/${e.dataset.folder}`;
      songs = await getSongs(folder);

      songUL.innerHTML = "";
      for (const song of songs) {
        const artist = songMetadata[song] || "Unknown Artist";
        songUL.innerHTML += `
          <li data-song="${song}">
            <img class="invert" src="music.svg" alt="" />
            <div class="info">
              <div>${decodeURIComponent(song).replace(".mp3", "")}</div>
              <div>${artist}</div>
            </div>
            <div class="playnow">
              <span>Play Now</span>
              <img class="invert" src="play.svg" alt="" />
            </div>
          </li>`;
      }

      document.querySelectorAll(".songList li").forEach((li) => {
        li.addEventListener("click", () => {
          playMusic(li.getAttribute("data-song"));
        });
      });
    });
  });
}

main();
