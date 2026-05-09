// 🌌 Starry background
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let stars = [];
for (let i = 0; i < 120; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    dx: (Math.random() - 0.5) * 0.2,
    dy: (Math.random() - 0.5) * 0.2,
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gradient night sky
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0b0c1c");
  gradient.addColorStop(1, "#1a1a3d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = "white";
  stars.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();

    s.x += s.dx;
    s.y += s.dy;
    if (s.x < 0 || s.x > canvas.width) s.dx *= -1;
    if (s.y < 0 || s.y > canvas.height) s.dy *= -1;
  });

  requestAnimationFrame(drawStars);
}
drawStars();

// 🌙 Screen flow logic
const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  screens.forEach((s) => {
    if (s.id === id) {
      s.classList.add("active");
      s.setAttribute("aria-hidden", "false");
    } else {
      s.classList.remove("active");
      s.setAttribute("aria-hidden", "true");
    }
  });
}

// Start button
document.getElementById("startBtn").addEventListener("click", () => {
  showScreen("breathScreen");
  startBreathing();
});

// 🌬️ Breathing Exercise
// 🌬️ Breathing Exercise
let breathStep = 0;
let breathCycles = 0;
let breathTimeout;

function startBreathing() {
  breathStep = 0;
  breathCycles = 0;
  runBreathStep();
}

function runBreathStep() {
  const circle = document.getElementById("breathCircle");
  const label = document.getElementById("breathLabel");
  const progress = document.getElementById("breathProgress");

  const steps = ["Inhale", "Hold", "Exhale"];
  const durations = [4000, 4000, 6000];

  label.textContent = steps[breathStep];

  circle.classList.remove("big", "hold", "shrink");
  if (breathStep === 0) circle.classList.add("big");
  else if (breathStep === 1) circle.classList.add("hold");
  else if (breathStep === 2) circle.classList.add("shrink");

  breathTimeout = setTimeout(() => {
    // When we finish Exhale (step 2), increment cycle
    if (breathStep === 2) {
  breathCycles++;
  progress.textContent = `${breathCycles} / 3`;
  console.log("Cycle finished:", breathCycles);

  if (breathCycles > 3) {
    console.log("Switching to sound screen");
    clearTimeout(breathTimeout);
    showScreen("soundScreen");
    return;
  }
}


    breathStep = (breathStep + 1) % 3;
    runBreathStep();
  }, durations[breathStep]);
}


// Skip button → jump to sounds
document.getElementById("breathSkip").addEventListener("click", () => {
  clearTimeout(breathTimeout);
  breathStep = 0;
  breathCycles = 0;
  document.getElementById("breathLabel").textContent = "";
  document.getElementById("breathProgress").textContent = "0 / 3";
  const circle = document.getElementById("breathCircle");
  circle.classList.remove("big", "hold", "shrink");
  showScreen("soundScreen");
});

// 🎵 Calming Sounds
document.querySelectorAll(".sound-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // stop all sounds
    document.querySelectorAll("audio").forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });

    // play the chosen one
    const sound = document.getElementById(btn.dataset.sound);
    sound.play();

    // update avatar mood
    document.getElementById("avatar").textContent = "😌";
  });
});
document.getElementById("soundNext").addEventListener("click", () => {
  document.querySelectorAll("audio").forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
  showBubbleScreen();
});

let sheepCount = 0;
let sheepInterval;


// 🫧 Bubble Wrap
let bubbles = [];

function generateBubbles() {
  const grid = document.getElementById("bubbleGrid");
  const messageDiv = document.getElementById("bubbleMessage");
  grid.innerHTML = "";
  messageDiv.textContent = "";
  const words = ["Calm","Peace","Joy","Rest","Love","Hope"];

  bubbles = []; // reset global
  const clickedWords = {};

  // prepare words
  const bubbleWords = [];
  for (let i=0;i<16;i++) bubbleWords.push(words[i%words.length]);
  bubbleWords.sort(()=>Math.random()-0.5);

  bubbleWords.forEach(word=>{
    const b = document.createElement("div");
    b.className = "bubble";
    b.textContent = word;
    grid.appendChild(b);
    bubbles.push(b);

    b.addEventListener("click",()=>{
      if(b.classList.contains("popped")) return;
      b.classList.add("popped");

      // sound
      const popSound = new Audio("pop.mp3");
      popSound.play();

      clickedWords[word] = (clickedWords[word]||0)+1;
      const total = bubbles.filter(x=>x.textContent===word).length;
      if(clickedWords[word]===total){
        messageDiv.textContent=`Awesome! All "${word}" bubbles popped! Keep going!`;
        messageDiv.classList.add("show");
        setTimeout(()=>messageDiv.classList.remove("show"),2000);
      }
    });
  });
}

// drifting animation
setInterval(()=>{
  bubbles.forEach(b=>{
    if(!b.classList.contains("popped")){
      b.style.transform=`translate(${Math.random()*8-4}px, ${Math.random()*8-4}px)`;
    }
  });
}, 300);

// Reset bubbles whenever the bubble screen is shown
function showBubbleScreen() {
  showScreen("bubbleScreen");
  generateBubbles(); // reset all bubbles
}



document.getElementById("soundNext").addEventListener("click", () => {
  clearInterval(sheepInterval);
  showScreen("bubbleScreen");
  startSheepGame();
});


generateBubbles();
document.getElementById("bubbleNext").addEventListener("click", () => {
  showScreen("goodnightScreen");
});

// ✨ Goodnight
document.getElementById("toRewards").addEventListener("click", () => {
  showScreen("rewardsScreen");
  updateRewards();
});

// 🌌 Rewards
let streak = 0;
function updateRewards() {
  streak++;
  document.getElementById("streakCount").textContent = streak;
  document.getElementById(
    "rewardText"
  ).textContent = `You unlocked a new dream sky! (${streak} nights)`;
}
document.getElementById("backToStart").addEventListener("click", () => {
  showScreen("startScreen");
});
