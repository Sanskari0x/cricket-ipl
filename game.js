// ===== DEVICE DETECTION =====
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===== PROFILE =====
let profile = JSON.parse(localStorage.getItem("iplProfile")) || {
  matches: 0, wins: 0, totalRuns: 0, highScore: 0
};

function saveProfile() {
  localStorage.setItem("iplProfile", JSON.stringify(profile));
}

document.getElementById("career").textContent =
  `Matches: ${profile.matches} | Wins: ${profile.wins} | Runs: ${profile.totalRuns} | Best: ${profile.highScore}`;

// ===== LEAGUE STATE =====
let team = "";
let difficulty = "easy";
let match = 1;
let wins = 0;

function saveLeague() {
  localStorage.setItem("iplLeague", JSON.stringify({ team, match, wins, difficulty }));
}

function loadLeague() {
  const data = JSON.parse(localStorage.getItem("iplLeague"));
  if (!data) return false;
  team = data.team;
  match = data.match;
  wins = data.wins;
  difficulty = data.difficulty;
  return true;
}

// ===== GAME STATE =====
let score = 0;
let balls = 0;
let wickets = 0;
let playing = false;

// ===== CANVAS =====
const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

let ballX = 0;
let speed = 3;
let hitZone = 420;

// ===== AUDIO =====
const hitSound = new Audio("assets/audio/bat-hit.mp3");
const crowdSound = new Audio("assets/audio/crowd-cheer.mp3");

// ===== STADIUMS =====
const stadiums = [
  { pitch: "#7cc576", crowd: "#3a6ea5" },
  { pitch: "#6cc06c", crowd: "#a57a3a" },
  { pitch: "#7fbf7f", crowd: "#6a3aa5" }
];
let currentStadium = 0;

function setStadium() {
  const s = stadiums[currentStadium % stadiums.length];
  canvas.style.background = s.pitch;
  document.body.style.background = s.crowd;
  currentStadium++;
}

// ===== TEAM SELECT =====
function selectTeam(name) {
  team = name;
  document.getElementById("teamName").textContent = team;
  document.getElementById("menu").style.display = "none";
  showTutorial();
}

// ===== TUTORIAL =====
function showTutorial() {
  if (localStorage.getItem("playedBefore")) {
    showGame();
    return;
  }

  const t = document.getElementById("tutorial");

  if (isMobile) {
    t.innerHTML = `<h3>How to Play</h3>
      <p>Tap to hit</p>
      <p>Tap left/right to aim</p>
      <button onclick="startFirstGame()">Start</button>`;
  } else {
    t.innerHTML = `<h3>How to Play</h3>
      <p>Press SPACE to hit</p>
      <p>Use ← → to aim</p>
      <button onclick="startFirstGame()">Start</button>`;
  }

  t.style.display = "block";
}

function startFirstGame() {
  localStorage.setItem("playedBefore", "yes");
  document.getElementById("tutorial").style.display = "none";
  showGame();
}

function showGame() {
  document.getElementById("game").style.display = "block";
}

// ===== MATCH =====
function startMatch() {
  setStadium();
  score = 0;
  balls = 0;
  wickets = 0;
  playing = true;

  if (difficulty === "easy") speed = 3;
  if (difficulty === "medium") speed = 5;
  if (difficulty === "hard") speed = 7;

  updateScore();
  nextBall();
}

function nextBall() {
  if (!playing) return;
  ballX = 0;
  animateBall();
}

function animateBall() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(420, 80, 5, 60);

  ctx.beginPath();
  ctx.arc(ballX, 110, 8, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

  ballX += speed;
  speed += 0.02;

  if (ballX > canvas.width) {
    ballResult(false);
    return;
  }

  requestAnimationFrame(animateBall);
}

function tryHit() {
  if (!playing) return;

  const timing = Math.abs(ballX - hitZone);

  if (timing < 10) { score += 6; crowdSound.play(); }
  else if (timing < 20) score += 4;
  else if (timing < 35) score += 2;
  else wickets++;

  hitSound.play();
  ballResult(true);
}

function ballResult() {
  balls++;
  updateScore();

  if (balls >= 6 || wickets >= 3) endMatch();
  else setTimeout(nextBall, 800);
}

function updateScore() {
  document.getElementById("score").textContent = score;
  document.getElementById("balls").textContent = balls;
  document.getElementById("wickets").textContent = wickets;
}

// ===== CONTROLS =====
document.addEventListener("keydown", e => {
  if (e.code === "Space") tryHit();
});
canvas.addEventListener("click", tryHit);

// ===== END MATCH =====
function endMatch() {
  playing = false;

  profile.matches++;
  profile.totalRuns += score;
  if (score > profile.highScore) profile.highScore = score;
  if (score >= 12) { wins++; profile.wins++; }

  saveProfile();
  saveLeague();

  match++;

  if (wins >= 2 && difficulty === "easy") difficulty = "medium";
  if (wins >= 4 && difficulty === "medium") difficulty = "hard";

  if (match > 5) showLeague();
}

function showLeague() {
  document.getElementById("game").style.display = "none";
  document.getElementById("league").style.display = "block";

  let msg = team + " won " + wins + " matches.";
  if (wins >= 4) msg += " 🏆 CHAMPION!";
  document.getElementById("result").textContent = msg;
    }
