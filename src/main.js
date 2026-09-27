/**
 * Mahalaya Audio Player - Minimal Logic
 */
import { musicPlaylist, devotionalPlaylist } from './playlistData.js';

let playlist = musicPlaylist;
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Wake Lock state
let wakeLock = null;

// DOM Elements - Player
const audio = document.getElementById('audio-element');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const coverArt = document.getElementById('cover-art');
const progressBarBg = document.getElementById('progress-bar-bg');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressBarThumb = document.getElementById('progress-bar-thumb');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

// DOM Elements - Top Bar & Modals
const clockEl = document.getElementById('clock');
const countdownEl = document.getElementById('countdown');
const onlineCountEl = document.getElementById('online-count');
const pujaRadioBtn = document.getElementById('puja-radio-btn');
const playlistModal = document.getElementById('playlist-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const trackListEl = document.getElementById('track-list');
const tabMusic = document.getElementById('tab-music');
const tabDevotional = document.getElementById('tab-devotional');
const playlistDesc = document.querySelector('.playlist-desc'); // So we can change the description text

// Initialize
function init() {
  updateClock();
  setInterval(updateClock, 1000 * 60);

  updateCountdown();
  
  // Connect real-time visitor count
  setupRealtimePresence();

  if (playlist.length > 0) {
    loadTrack(currentTrackIndex);
    renderPlaylist();
    loadPlaylistDurations(musicPlaylist);
    loadPlaylistDurations(devotionalPlaylist);
  }
}
// Add your Firebase Config credentials here
const firebaseConfig = {
  apiKey: "AIzaSyArpEhSnWO56DEMjwQkNXBIqx57WN_gV4w",
  authDomain: "mahalayamusic-26809.firebaseapp.com",
  databaseURL: "https://mahalayamusic-26809-default-rtdb.firebaseio.com",
  projectId: "mahalayamusic-26809",
  storageBucket: "mahalayamusic-26809.firebasestorage.app",
  messagingSenderId: "671483039309",
  appId: "1:671483039309:web:89a948ab4ee9a247db1604"
};

function setupRealtimePresence() {
  const { initializeApp, getDatabase, ref, onValue, push, onDisconnect, set } = window.FirebaseDB;

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  // References
  const connectedRef = ref(db, '.info/connected');
  const onlineUsersRef = ref(db, 'online_users');
  const myUserRef = push(onlineUsersRef);

  // Monitor Connection Status
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // When connected, set up automatic removal when tab closes
      onDisconnect(myUserRef).remove();

      // Add this user session to online list
      set(myUserRef, true);
    }
  });

  // Listen to total online user changes across ALL visitors
  onValue(onlineUsersRef, (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 1;
    onlineCountEl.textContent = `${count} online`;
  });
}
// Preloader Dismiss Handler
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // 600ms minimum display time so users experience the festive animation
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 600);
  }
});
// Top Bar Logic
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes;
  clockEl.textContent = `${hours}:${minutes} ${ampm}`;
}

// Utility helper to convert English digits to Bengali digits
function toBengaliNumber(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, digit => bnDigits[digit]);
}

function updateCountdown() {
  const now = new Date();
  const year = now.getFullYear();

  // Normalize today's date to midnight for accurate date checking
  const today = new Date(year, now.getMonth(), now.getDate());

  // Target Mahalaya for current year (October 10)
  let mahalaya = new Date(year, 9, 10);

  // Daily greetings dictionary for Durga Puja days (October 11 to October 21)
  const pujaGreetings = {
    11: "✨ শুভ প্রথমা! ✨",
    12: "✨ শুভ দ্বিতীয়া! ✨",
    13: "✨ শুভ তৃতীয়া! ✨",
    14: "✨ শুভ চতুর্থী! ✨",
    15: "✨ শুভ পঞ্চমী! ✨",
    16: "✨ শুভ ষষ্ঠী! ✨",
    17: "✨ শুভ সপ্তমী! ✨",
    18: "✨ শুভ সপ্তমী! ✨",
    19: "✨ শুভ মহা অষ্টমী! ✨",
    20: "✨ শুভ মহা নবমী! ✨",
    21: "✨ শুভ বিজয়া দশমী! ✨"
  };

  const isOctober = now.getMonth() === 9;
  const dayOfMonth = today.getDate();

  if (today < mahalaya) {
    // 1. Before Mahalaya: Show Countdown to Mahalaya
    const diffTime = mahalaya - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const bnDays = toBengaliNumber(diffDays);
    countdownEl.textContent = `মহালয়ার বাকি মাত্র ${bnDays} দিন`;

  } else if (today.getTime() === mahalaya.getTime()) {
    // 2. On Mahalaya Day (Oct 10)
    countdownEl.textContent = "✨ শুভ মহালয়া! ✨";

  } else if (isOctober && dayOfMonth >= 11 && dayOfMonth <= 21) {
    // 3. Post-Mahalaya Durga Puja Days (Oct 11 - Oct 21): Show daily greeting
    countdownEl.textContent = pujaGreetings[dayOfMonth];

  } else {
    // 4. After Oct 21: Target next year's Mahalaya
    const nextMahalaya = new Date(year + 1, 9, 10);
    const diffTime = nextMahalaya - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const bnDays = toBengaliNumber(diffDays);
    countdownEl.textContent = `মহালয়ার বাকি মাত্র ${bnDays} দিন`;
  }
}
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
}
// Initialize Dhak Audio from public/audio/dhak.mp3
const dhakAudio = new Audio('audio/dhak.mp3'); // or '/audio/dhak.mp3'
dhakAudio.loop = true; // Infinite loop

let isDhakPlaying = false;
let wasMusicPlayingBeforeDhak = false;

const dhakBtn = document.getElementById('dhak-btn');

// Toggle Dhak with Audio Priority
function toggleDhak() {
  if (!isDhakPlaying) {
    // 1. Remember if main track was playing before starting Dhak
    wasMusicPlayingBeforeDhak = isPlaying;

    // 2. Pause main music player if active
    if (isPlaying) {
      pauseTrack();
    }

    // 3. Play Dhak on loop
    dhakAudio.currentTime = 0;
    dhakAudio.play().then(() => {
      isDhakPlaying = true;
      if (dhakBtn) dhakBtn.classList.add('active');
      requestWakeLock(); // keep screen on while Dhak plays too
    }).catch(err => console.error("Error playing Dhak audio:", err));

  } else {
    // 4. Stop Dhak
    stopDhak();

    // 5. Resume main music if it was playing before Dhak started
    if (wasMusicPlayingBeforeDhak) {
      playTrack();
      wasMusicPlayingBeforeDhak = false;
    }
  }
}

// Stop Dhak helper function
function stopDhak() {
  isDhakPlaying = false;
  dhakAudio.pause();
  dhakAudio.currentTime = 0;
  if (dhakBtn) dhakBtn.classList.remove('active');

  // Only release the wake lock here if the main track isn't also playing
  if (!isPlaying) releaseWakeLock();
}

// Attach Event Listener
if (dhakBtn) {
  dhakBtn.addEventListener('click', toggleDhak);
}
// Modal Logic
pujaRadioBtn.addEventListener('click', () => {
  playlistModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
});

closeModalBtn.addEventListener('click', () => {
  playlistModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
});

// Render Playlist Modal items
// Render Playlist Modal items
function renderPlaylist() {
  trackListEl.innerHTML = '';
  playlist.forEach((track, index) => {
    const isCurrent = index === currentTrackIndex;
    const item = document.createElement('div');
    item.className = `track-item ${isCurrent ? 'playing' : ''}`;
    
    const indexStr = (index + 1).toString().padStart(2, '0');
    const thumbSrc = track.thumbnail || '/mahalaya-bg.png';
    
    // Fallback to '--:--' if durationStr is not loaded yet
    const displayDuration = track.durationStr || '--:--';
    
    item.innerHTML = `
      <div class="track-index">${indexStr}</div>
      <img src="${thumbSrc}" class="track-item-img" alt="cover">
      <div class="track-item-info">
        <div class="track-item-title">${track.title}</div>
        <div class="track-item-artist">${track.artist}</div>
      </div>
      <div class="track-item-duration" data-track-index="${index}">${displayDuration}</div>
    `;
    
    item.addEventListener('click', () => {
      currentTrackIndex = index;
      loadTrack(index);
      playTrack();
      renderPlaylist();
    });
    
    trackListEl.appendChild(item);
  });
}
// Preload audio metadata in background to get accurate durations
function loadPlaylistDurations(playlistArray) {
  playlistArray.forEach((track, index) => {
    if (track.durationStr) return; // Skip if already set

    const tempAudio = new Audio();
    tempAudio.preload = 'metadata';
    tempAudio.src = track.src;

    tempAudio.addEventListener('loadedmetadata', () => {
      track.durationStr = formatTime(tempAudio.duration);
      
      // Dynamically update duration in modal if currently displayed
      const durationEl = trackListEl.querySelector(`.track-item-duration[data-track-index="${index}"]`);
      if (durationEl && playlist.includes(track)) {
        durationEl.textContent = track.durationStr;
      }
    });

    tempAudio.addEventListener('error', () => {
      track.durationStr = '--:--';
    });
  });
}
// Audio Player Logic
function loadTrack(index) {
  const track = playlist[index];
  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  coverArt.src = track.thumbnail || '/mahalaya-bg.png';
  
  progressBarFill.style.width = '0%';
  progressBarThumb.style.left = '0%';
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent = track.durationStr; // fallback until loaded
}

function togglePlay() {
  isPlaying ? pauseTrack() : playTrack();
}

function playTrack() {
  if (isDhakPlaying) {
    stopDhak();
    wasMusicPlayingBeforeDhak = false;
  }
  audio.play();
  isPlaying = true;
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
coverArt.classList.add('playing'); 
  requestWakeLock();

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn("Autoplay prevented or file missing.", error);
      pauseTrack();
    });
  }
}

function pauseTrack() {
  isPlaying = false;
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  audio.pause();
 coverArt.classList.remove('playing');
  // Only release if Dhak isn't also playing
  if (!isDhakPlaying) releaseWakeLock();
}

function nextTrack() {
  if (isShuffle && playlist.length > 1) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentTrackIndex);
    currentTrackIndex = randomIndex;
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  }

  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
  renderPlaylist();
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
  renderPlaylist();
}

// ===================== Screen Wake Lock =====================
// Keeps the screen from sleeping/dimming while music (or Dhak) is playing.
// Not supported in every browser (e.g. older Safari) - fails silently there.
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  if (wakeLock) return; // already held

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  } catch (err) {
    console.warn('Wake Lock request failed:', err);
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    try {
      await wakeLock.release();
    } catch (err) {
      // ignore
    }
    wakeLock = null;
  }
}

// The wake lock is auto-released by the browser when the tab is hidden.
// Re-acquire it when the tab becomes visible again, if audio is still playing.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (isPlaying || isDhakPlaying)) {
    requestWakeLock();
  }
});

// Progress Bar
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  if (isNaN(duration)) return;
  
  const progressPercent = (currentTime / duration) * 100;
  progressBarFill.style.width = `${progressPercent}%`;
  progressBarThumb.style.left = `${progressPercent}%`;
  
  currentTimeEl.textContent = formatTime(currentTime);
  totalTimeEl.textContent = formatTime(duration);
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  
  if (!isNaN(duration)) {
    audio.currentTime = (clickX / width) * duration;
  }
}

// Listeners
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playTrack();
  } else {
    nextTrack();
  }
});progressBarBg.addEventListener('click', setProgress);

audio.addEventListener('loadedmetadata', () => {
  const durationText = formatTime(audio.duration);
  totalTimeEl.textContent = durationText;
  
  if (playlist[currentTrackIndex]) {
    playlist[currentTrackIndex].durationStr = durationText;
  }
});

// Tab Switching Logic
tabMusic.addEventListener('click', () => {
  tabMusic.classList.add('active');
  tabDevotional.classList.remove('active');
  playlistDesc.textContent = "The main curated Durga Puja playlist.";
  
  playlist = musicPlaylist;
  renderPlaylist();
});

tabDevotional.addEventListener('click', () => {
  tabDevotional.classList.add('active');
  tabMusic.classList.remove('active');
  playlistDesc.textContent = "Traditional and devotional Mahalaya tracks.";
  
  playlist = devotionalPlaylist;
  renderPlaylist();
});
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === ' ') {
    // Don't trigger if user is typing inside an input field
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag !== 'input' && activeTag !== 'textarea') {
      e.preventDefault(); // Prevent page scrolling
      togglePlay();
    }
  }
});

// Run
init();
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
