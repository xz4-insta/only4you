import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import Optimization from "./optimization.js";

// ADD PUZZLE STYLES
const style = document.createElement('style');
style.textContent = `
  .puzzle-tile {
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
    user-select: none;
    -webkit-user-drag: none;
    border-radius: 8px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    box-sizing: border-box;
  }
  .puzzle-tile:active {
    transform: scale(0.92);
  }
  @keyframes breakPiece {
    0% { transform: translate(var(--tx), var(--ty)) rotate(var(--tr)) scale(0); opacity: 0; }
    100% { transform: translate(0, 0) rotate(0) scale(1); opacity: 1; }
  }
  .tile-breaking {
    animation: breakPiece 0.6s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .quiz-box {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 20px;
    margin: 15px auto;
    max-width: 90%;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
  .quiz-opt {
    width: 100%;
    padding: 12px 15px !important;
    font-size: 1rem !important;
    margin: 0 !important;
    white-space: normal;
    height: auto !important;
    line-height: 1.3;
    border-radius: 12px !important;
  }
  #quizContainer {
    max-height: 420px;
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-width: thin;
    scrollbar-color: #ff4d6d rgba(255,255,255,0.1);
  }
  #quizContainer::-webkit-scrollbar {
    width: 6px;
  }
  #quizContainer::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
  }
  #quizContainer::-webkit-scrollbar-thumb {
    background-color: #ff4d6d;
    border-radius: 10px;
  }
  .stage-continue-btn {
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 20px auto;
    padding: 12px 30px;
    background: linear-gradient(90deg, #ff4d6d, #ff8fab);
    border: none;
    border-radius: 30px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(255,77,109,0.3);
    transition: 0.3s;
  }
  .stage-continue-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(255,77,109,0.5);
  }
  /* ================= PREMIUM GLASSMORPHISM ================= */
  .card, .envelope-wrapper, .modal-content {
    background: rgba(255, 255, 255, 0.4) !important;
    backdrop-filter: blur(15px) !important;
    -webkit-backdrop-filter: blur(15px) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1) !important; /* Neutral shadow */
  }
  
  /* ================= 3D ENVELOPE ================= */
  .envelope-container {
    perspective: 1500px;
    width: 300px;
    height: 200px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5000;
    cursor: pointer;
    transition: 0.8s ease;
  }
  
  .envelope {
    position: relative;
    width: 100%;
    height: 100%;
    background: #ff4d6d;
    border-radius: 0 0 10px 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    transform-style: preserve-3d;
  }
  
  .envelope-flap {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-left: 150px solid transparent;
    border-right: 150px solid transparent;
    border-top: 100px solid #ff1a4d;
    transform-origin: top;
    transition: 0.6s ease;
    z-index: 2;
  }
  
  .envelope-opened .envelope-flap {
    transform: rotateX(180deg);
  }
  
  .envelope-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    letter-spacing: 2px;
    text-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 3;
    pointer-events: none;
  }

  /* ================= NEW PREMIUM BOKEH BACKGROUND & CARD SHINE ================= */
  .card {
    position: relative;
    overflow: hidden;
  }
  .card::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 30%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: skewX(-25deg);
    animation: premiumShine 6s infinite;
    pointer-events: none;
    z-index: 10;
  }
  @keyframes premiumShine {
    0% { left: -100%; }
    15% { left: 200%; }
    100% { left: 200%; }
  }

  .bokeh-particle {
    position: fixed;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,105,180,0.3) 50%, transparent 100%);
    pointer-events: none;
    z-index: -1;
    animation: bokehFloat linear infinite;
    opacity: 0;
  }
  
  @keyframes bokehFloat {
    0% { transform: translateY(110vh) scale(0.5); opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
  }

  /* ================= FALLING HEARTS & FLOWERS ================= */
  .floatHeart {
    position: fixed;
    pointer-events: none;
    font-size: 28px;
    z-index: 9999;
    animation: heartFloat 1s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
    text-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
  @keyframes heartFloat {
    0% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
    100% { opacity: 0; transform: translateY(-150px) scale(1.8) rotate(45deg); }
  }

  /* ================= CONTINUOUS EMOJI SNOWFALL ================= */
  .falling-emoji {
    position: fixed;
    top: -50px;
    z-index: 998;
    pointer-events: none;
    animation: fallDown linear forwards;
    filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
  }
  @keyframes fallDown {
    0%   { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(110vh) rotate(360deg); }
  }

  /* ================= 3D ENVELOPE ENHANCEMENTS ================= */
  .envelope {
    animation: drift 3s ease-in-out infinite alternate;
  }
  @keyframes drift {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-8px); }
  }
  
  .envelope::after {
    content: "CLICK TO OPEN 💌";
    position: absolute;
    top: 60%; left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
    z-index: 3;
    pointer-events: none;
    text-shadow: 0 2px 4px rgba(0,0,0,0.4);
    background: rgba(0,0,0,0.25);
    padding: 8px 16px;
    border-radius: 20px;
    white-space: nowrap;
    animation: pulseText 2s infinite;
    transition: opacity 0.3s ease;
  }
  
  .envelope.envelope-opened::after {
    opacity: 0;
    animation: none;
  }
  
  @keyframes pulseText {
    0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
  }
  

  /* ================= BEAUTIFUL FUTURISTIC TRANSITION ================= */
  #transitionOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
    background: rgba(255, 105, 180, 0.05);
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    opacity: 0;
    transition: opacity 0.4s ease, backdrop-filter 0.4s ease, -webkit-backdrop-filter 0.4s ease;
  }

  #transitionOverlay::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) scaleX(0) rotate(-15deg);
    width: 150vw;
    height: 6px;
    background: #fff;
    box-shadow: 0 0 40px 15px #ff4d6d, 0 0 80px 30px #ff8fab;
    border-radius: 50%;
    opacity: 0;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
  }
  
  #transitionOverlay.active {
    opacity: 1;
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
  }
  
  #transitionOverlay.active::after {
    opacity: 1;
    transform: translate(-50%, -50%) scaleX(1) rotate(-15deg);
  }

  .stage {
    animation: none;
  }
  .stage.active {
    animation: stageReveal 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes stageReveal {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }


  /* ================= VISUALIZER ================= */
  #visualizerCanvas {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    z-index: 100;
    pointer-events: none;
    opacity: 0.6;
  }

  .premium-shimmer {
    background: linear-gradient(-45deg, #ff4d6d, #ff8fab, #ff4d6d, #ff8fab);
    background-size: 400% 400%;
    animation: shimmerGrad 3s ease infinite;
  }
  
  @keyframes shimmerGrad {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.05); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  .monkey-gif {
    animation: pulse 2s infinite ease-in-out;
  }
  .fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -45%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
`;
document.head.appendChild(style);


let currentStage = 1;

let love = 0;
let yesScale = 1;


export function applyStageLocking(plan){

const stageFlow = {
"48":[1,6],
"89":[1,2,3,6],
"169":[1,2,3,4,6],
"299":[1,2,3,4,5,6]
}

window.allowedStages = stageFlow[plan] || [1,6];

}


/* =========================================
INIT ENGINE
========================================= */

export function initEpicInteractions(data){
  window.storyData = data;
  
  // Ensure full journey and mock data if in preview mode
  const isPreview = window.location.search && new URLSearchParams(window.location.search).get('preview') === '1';
  
  if (isPreview) {
    // Inject Mock Data if empty
    if (!data.message) data.message = "You are the most special person in my life. Every moment with you is a gift! ❤️";
    if (!data.images || data.images.length === 0) {
      data.images = [
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522673607200-164883eecd0c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=600&auto=format&fit=crop"
      ];
    }
    if (!data.quiz || data.quiz.length === 0) {
      data.quiz = [
        { question: "Where was our first date? ☕", options: ["Coffee Shop", "Park", "Cinema", "Beach"] },
        { question: "What's my favorite thing about you? ✨", options: ["Smile", "Kindness", "Humor", "Everything!"] }
      ];
    }
  }

  // Actually apply the stage locking based on the plan!
  applyStageLocking(String(data.plan || "48"));
  
  // Force full flow for carousel regardless of plan
  if (isPreview) {
    window.allowedStages = [1, 2, 3, 4, 5, 6]; 
  }
  
  initEnvelope(data, () => {
    initBGM(data);
    createVisualizer();
    createBokehParticles();

  if (data.scratchMessage) {
    const idx = window.allowedStages?.indexOf(6);
    if (idx !== -1 && idx !== undefined) window.allowedStages.splice(idx, 0, "scratch");
  }

  if (data.plan === "169" || data.plan === "299") {
    const idx = window.allowedStages?.indexOf(6);
    if (idx !== -1 && idx !== undefined) window.allowedStages.splice(idx, 0, "catchgame");
  }

  initProgressDots()
  initBGM(data)
  initLetter(data)
  initMemories(data)
  initVoices(data)
  initQuiz(data)
  initCatchGame(data)
  initScratch(data)
  initProposalGame()
  initTransitions()

    showStage(1)

    // Start Auto-Cycle if in preview mode
    if (isPreview) {
      startPreviewAutoCycle();
    }
  });
}

function startPreviewAutoCycle() {
  setInterval(() => {
    cycleNextStage();
  }, 3500); // 3.5s to account for transition time
}

function cycleNextStage() {
  const flow = window.allowedStages || [1, 2, 3, 4, 5, 6];
  const index = flow.indexOf(currentStage);
  
  if (index === -1) return;
  
  let next = flow[index + 1];
  
  // If at the end, loop back to the first stage
  if (!next) {
    next = flow[0];
  }

  tvStaticTransition(() => {
    showStage(next);
    
    // Extra fix: If we loop back to Stage 1, click to open the letter automatically
    if (next === 1) {
      setTimeout(() => {
        const letter = document.getElementById("letter");
        if (letter) letter.click();
      }, 1000);
    }
  });
}


/* =========================================
/* =========================================
BG MUSIC
========================================= */

function initBGM(data) {
  // If user provided a song, use it. 
  // If not, and the plan is premium, use the default "romantic.mp3"
  let bgSource = data.bgMusic;
  if (!bgSource && (data.plan === "169" || data.plan === "299")) {
      bgSource = "music/romantic.mp3";
  }

  if (!bgSource) return;
  
  const bgm = document.createElement("audio");
  bgm.id = "globalBgm";
  bgm.src = bgSource;
  bgm.loop = true;
  bgm.volume = 0.15; // Lowered default volume
  document.body.appendChild(bgm);

  // Start playing on the very first tap anywhere in the document
  const playOnce = () => {
    bgm.play().catch(e => console.log("Autoplay prevented", e));
    document.removeEventListener("click", playOnce);
  };
  document.addEventListener("click", playOnce);
}

window.duckBGM = function(ducked) {
  const bgm = document.getElementById("globalBgm");
  if(!bgm) return;
  // Fade volume between 0.15 (Normal) and 0.02 (Ducked)
  let target = ducked ? 0.02 : 0.15;
  let current = bgm.volume;
  let step = ducked ? -0.02 : 0.02;
  const fade = setInterval(() => {
    current += step;
    // Bounds checking
    if((ducked && current <= target) || (!ducked && current >= target)) {
      bgm.volume = target;
      clearInterval(fade);
    } else {
      bgm.volume = Math.max(0, Math.min(1, current));
    }
  }, 100);
}

/* =========================================
PREMIUM: 3D ENVELOPE
========================================= */

function initEnvelope(data, onComplete) {
  // Templates each have their own built-in envelope in their HTML.
  // We do NOT inject a second one — just call onComplete immediately.
  onComplete();
}

function createBokehParticles() {
  if (typeof Optimization !== 'undefined' && Optimization.isLowEnd) return;
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'bokeh-particle';
    const size = Math.random() * 50 + 20;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    document.body.appendChild(p);
  }
}


/* =========================================
BEAUTIFUL STAGE TRANSITION (works on all devices)
========================================= */

function triggerTransition(callback) {
  let overlay = document.getElementById("transitionOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "transitionOverlay";
    document.body.appendChild(overlay);
  }

  // Fade the overlay in
  overlay.classList.add("active");

  // After a short flash, run the callback (stage switch happens here)
  setTimeout(() => {
    if (callback) callback();
    // Fade back out quickly
    setTimeout(() => {
      overlay.classList.remove("active");
    }, 80);
  }, 200);
}


/* =========================================
PREMIUM: MUSIC VISUALIZER
========================================= */

function createVisualizer() {
  const bgm = document.getElementById("globalBgm");
  if (!bgm || Optimization.isLowEnd) return;

  const canvas = document.createElement("canvas");
  canvas.id = "visualizerCanvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(bgm);
  const analyzer = audioCtx.createAnalyser();

  source.connect(analyzer);
  analyzer.connect(audioCtx.destination);

  analyzer.fftSize = 64;
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    canvas.width = window.innerWidth;
    const width = canvas.width;
    const height = canvas.height;

    analyzer.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = `rgba(231, 84, 128, ${dataArray[i] / 255})`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
  }

  bgm.onplay = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    draw();
  };
}

/* =========================================
STAGE SYSTEM
========================================= */

function showStage(n){

document.querySelectorAll(".stage").forEach(s=>{
s.classList.remove("active")
})

const stage = document.getElementById("stage"+n)

if(stage){

stage.classList.add("active")
currentStage = n
updateDots()

if(n === 3 && typeof window.checkPuzzleTrigger === "function") {
  window.checkPuzzleTrigger();
}
}
/* FINAL QUESTION INJECTION */

if(n === 6){

const q = document.getElementById("finalQuestion")

if(q){

const text = window.storyData?.finalQuestion || "Will you be mine forever? 💖"

q.innerHTML = ""
let i = 0

const type = setInterval(()=>{

q.innerHTML += text[i]
i++

if(i >= text.length){
clearInterval(type)
}

},40)

}

}
}

/* =========================================
NEXT STAGE WITH PLAN LOCK
========================================= */

function nextStage(){

const flow = window.allowedStages || [1,6]

const index = flow.indexOf(currentStage)

if(index === -1) return

const next = flow[index+1]

if(next){
  triggerTransition(()=>{
    showStage(next)
  })
}

}

window.nextStage = nextStage
function prevStage(){

const flow = window.allowedStages || [1,6]

const index = flow.indexOf(currentStage)

if(index === -1) return

const prev = flow[index-1]

if(prev){
  triggerTransition(()=>{
    showStage(prev)
  })
}

}

window.prevStage = prevStage

/* =========================================
TV STATIC TRANSITION
========================================= */

function initTransitions(){

const style=document.createElement("style")

style.innerHTML=`
.tv-static{
position:fixed;
top:0;
left:0;
width:100vw;
height:100vh;
background:url("https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif");
background-size:cover;
z-index:9999;
opacity:0;
pointer-events:none;
transition:opacity .3s;
}
.fade-in{
animation:fadeIn .6s ease;
}
@keyframes fadeIn{
from{opacity:0;transform:translateY(20px)}
to{opacity:1;transform:translateY(0)}
}

/* ADVANCED VOICE PLAYER */
.voice-player {
  background: rgba(255, 255, 255, 0.08); 
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 12px 15px;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(10px);
  text-align: left;
}
.player-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.play-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  border: none;
  background: #ff4d6d;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 5px 15px rgba(255, 77, 109, 0.3);
  font-size: 16px;
  padding: 0;
}
.play-btn:hover { transform: scale(1.1); background: #ff758f; }
.play-btn svg { width: 16px; height: 16px; fill: currentColor; }

.voice-info {
  flex-grow: 1;
  overflow: hidden;
}
.voice-title { 
  font-weight: 600; 
  font-size: 0.9rem; 
  display: block; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  color: white;
}
.voice-time { 
  font-size: 0.75rem; 
  opacity: 0.8; 
  font-family: monospace; 
  color: #fff;
}

.seek-wrapper { 
  width: 100%; 
  display: flex; 
  align-items: center; 
  gap: 10px;
}
.seek-bar {
  flex-grow: 1;
  cursor: pointer;
  height: 5px;
  border-radius: 10px;
  accent-color: #ff4d6d;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
}

/* QUIZ STYLES */
.quiz-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  backdrop-filter: blur(10px);
}
.quiz-opt {
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  text-align: center;
}
.quiz-opt:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
.quiz-opt.selected {
  background: #ff4d6d;
  border-color: #ff8fab;
  box-shadow: 0 0 15px rgba(255, 77, 109, 0.4);
}
.seek-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
}

`

document.head.appendChild(style)


// TV Static removed — using beautiful triggerTransition instead
window.tvStatic = null;


}

function tvStaticTransition(callback){
  // Replaced TV Static with smooth fade transition
  triggerTransition(callback);
}



/* =========================================
PROGRESS DOTS
========================================= */

function initProgressDots(){

const container=document.getElementById("progressDots")
if(!container) return

container.innerHTML=""

for(let i of window.allowedStages){

const dot=document.createElement("div")
dot.className="dot"

if(i===1) dot.classList.add("active")

container.appendChild(dot)

}

}

function updateDots(){

const dots=document.querySelectorAll(".dot")

dots.forEach((d,i)=>{

d.classList.remove("active")

if(window.allowedStages[i] === currentStage){
d.classList.add("active")
}

})

}

/* =========================================
LETTER SYSTEM
========================================= */

function initLetter(data){

let envelopeOpened = false;

window.openLetter = function() {
  if (envelopeOpened) return; // prevent double-open
  envelopeOpened = true;

  const flap   = document.querySelector(".flap");
  const letter = document.getElementById("letterContent");
  const envelope = document.querySelector(".envelope");
  const btn = envelope?.closest(".card")?.querySelector("button[onclick=\"nextStage()\"]") 
             || document.querySelector("#stage1 button[onclick=\"nextStage()\"]");

  if (!flap || !letter) return;

  // Tactile pulse
  if (navigator.vibrate) navigator.vibrate([30, 20, 50]);

  // 1. Lift the envelope slightly and remove text
  if (envelope) {
    envelope.classList.add("envelope-opened");
    envelope.style.transition = "transform 0.3s ease";
    envelope.style.transform = "scale(1.05) translateY(-6px)";
  }

  // 2. Flip the flap open
  flap.style.transition = "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";
  flap.style.transform = "rotateX(180deg)";

  // 3. Rise the letter out
  setTimeout(() => {
    letter.style.transition = "bottom 0.5s cubic-bezier(0.22,1,0.36,1)";
    letter.style.bottom = "0";

    // Play BGM when letter opens
    const bgm = document.getElementById("bgmPlayer");
    if (bgm) {
      bgm.play().catch(e => console.log("BGM pass:", e));
    }

    // Start the continuous magical falling emojis
    if (typeof startEmojiSnowfall === "function") startEmojiSnowfall();
    
  }, 300);

  // 4. After letter is visible, reveal the Continue button
  setTimeout(() => {
    if (btn) {
      btn.style.display = "block";
      btn.style.opacity = "0";
      btn.style.transform = "translateY(10px)";
      btn.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      requestAnimationFrame(() => {
        btn.style.opacity = "1";
        btn.style.transform = "translateY(0)";
      });
    }
  }, 800);
};

// Hide "Begin Journey" button initially so it only shows after envelope opens
const stage1Btn = document.querySelector("#stage1 button[onclick=\"nextStage()\"]");
if (stage1Btn) stage1Btn.style.display = "none";


// Add Swipe to Open Mechanics
const envelope = document.querySelector(".envelope");
if(envelope) {
  let startY = 0;
  envelope.addEventListener("touchstart", (e) => startY = e.touches[0].clientY, {passive: true});
  envelope.addEventListener("touchmove", (e) => {
    let currentY = e.touches[0].clientY;
    if (startY - currentY > 40) { // Swiped up
      window.openLetter();
    }
  }, {passive: true});
}

// 3D Card Hover Effect for Desktop (Skip for low-end/mobile)
document.addEventListener("mousemove", (e) => {
  if (Optimization.isLowEnd || Optimization.isMobile) return;
  
  const cards = document.querySelectorAll(".card");
  const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
  cards.forEach(card => {
    // Only apply if not actively animating
    card.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });
});

document.addEventListener("mouseleave", () => {
  document.querySelectorAll(".card").forEach(card => {
    card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
  });
});

if(!data.message) return

const letter=document.getElementById("letterContent")
if(!letter) return

let i=0
const text=data.message

letter.innerHTML=""

const interval=setInterval(()=>{

letter.innerHTML+=text[i]
i++

if(i>=text.length){
clearInterval(interval)
}

},35)

}

/* =========================================
LOVE METER
========================================= */

const loveLevels=[
{point:0,text:"WARMING UP 💗"},
{point:200,text:"FEELING IT 💓"},
{point:400,text:"CRUSH MODE 😍"},
{point:600,text:"DEEP LOVE ❤️"},
{point:800,text:"SOULMATES 💞"},
{point:950,text:"ALMOST FOREVER 💍"},
{point:1000,text:"INFINITE LOVE ♾️"}
]

function getLoveLevel(){

let level=loveLevels[0].text

for(let l of loveLevels){

if(love>=l.point){
level=l.text
}

}

return level

}

window.increaseLove=function(){

const random=Math.floor(Math.random()*25)+15
love+=random

if(love>1000) love=1000

const percent=Math.floor((love/1000)*100)

const fill=document.getElementById("loveFill")
const big=document.getElementById("loveBig")
const tag=document.getElementById("loveLevelTag")
const sub=document.getElementById("loveSub")

if(fill) fill.style.width=percent+"%"
if(big) big.innerText=percent+"%"
if(tag) tag.innerText=getLoveLevel()

if(sub){

if(percent<40) sub.innerText="Love is growing..."
else if(percent<80) sub.innerText="Your hearts are syncing!"
else sub.innerText="This love is unstoppable!"

}

/* glow effect */

if(fill && percent>80){
fill.style.boxShadow="0 0 20px gold"
}

/* unlock */

if(love>=900){

const btn=document.getElementById("continueBtn")
if(btn) btn.style.display="inline-block"

}

/* heart particles */

spawnHearts()

}

/* =========================================
HEART PARTICLES
========================================= */

function spawnHearts(){
  const template = window.storyData?.template || "";
  const emoji = ["valentine", "anniversary"].includes(template) ? "🌹" : "💖";

  // Optimization: Reduce spawn count on low-end
  const count = Optimization.isLowEnd ? 1 : 5;

  const content = document.getElementById("loveLevelTag");
  if(content) {
    const rect = content.getBoundingClientRect();
    for(let i=0;i<count;i++){
      const heart=document.createElement("div")
      heart.innerHTML=emoji;
      heart.className="floatHeart"
      heart.style.left=(rect.left + rect.width/2 + (Math.random()*80-40))+"px"
      heart.style.top=(rect.top)+"px"
      document.body.appendChild(heart)
      setTimeout(()=> { if (heart.parentNode) heart.remove(); }, 1000)
    }
  } else {
    for(let i=0;i<count;i++){
      const heart=document.createElement("div")
      heart.innerHTML=emoji;
      heart.className="floatHeart"
      heart.style.left=(window.innerWidth/2+(Math.random()*120-60))+"px"
      heart.style.top=(window.innerHeight/2)+"px"
      document.body.appendChild(heart)
      setTimeout(()=> { if (heart.parentNode) heart.remove(); }, 1000)
    }
  }
}

/* =========================================
CONTINUOUS FALLING EMOJIS (ON BGM START)
========================================= */
function startEmojiSnowfall() {
  const template = window.storyData?.template || "";
  
  let emojis = ["💖", "🌸", "🌹", "✨", "💕"]; // Default romance mix (Hearts & Flowers)
  if (template === "anniversary") emojis = ["🥂", "💖", "🎉", "✨", "🎈"];
  if (template === "forgiveness") emojis = ["🥺", "🙏", "❤️‍🩹", "🌧️", "🌸"];
  if (template === "epic") emojis = ["✨", "🔥", "💖", "⭐", "💫"];

  const spawnDelay = (typeof Optimization !== 'undefined' && Optimization.isLowEnd) ? 3000 : 700;
  
  // Drop first immediately, then interval
  dropEmoji(emojis);
  setInterval(() => dropEmoji(emojis), spawnDelay);
}

function dropEmoji(emojis) {
  // Pick a random emoji from the template's mix
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  const el = document.createElement("div");
  el.innerText = emoji;
  el.className = "falling-emoji";
  el.style.left = (Math.random() * 90 + 5) + "vw";
  el.style.fontSize = (Math.random() * 15 + 15) + "px";
  el.style.opacity = (Math.random() * 0.4 + 0.3).toString();
  
  const duration = Math.random() * 5 + 8; // 8s to 13s
  el.style.animationDuration = duration + "s";
  // Random horizontal drift
  el.style.marginLeft = (Math.random() * 100 - 50) + "px";
  
  document.body.appendChild(el);
  setTimeout(() => { if(el.parentNode) el.remove(); }, duration * 1000);
}

/* =========================================
MEMORY SLIDESHOW
========================================= */

function initMemories(data){
  const screen=document.getElementById("tvScreen")
  if(!screen) return

  let index=0
  let lastTriggeredIndex = -1;
  let hasViewedOthers = false;
  let images=data.images || []
  let puzzleActive = false;
  let puzzleSolved = false;
  let slideshowInterval = null;

  const img=document.createElement("img")
  img.style.width="100%"
  img.style.height="100%"
  img.style.objectFit="cover"
  img.style.borderRadius="20px"
  img.style.transition="opacity 0.4s ease"
  img.style.opacity="1"

  screen.innerHTML=""

  if(images.length){
    screen.appendChild(img)
    updateDisplay(true); 
  }else{
    console.log("Only4You Debug: No images found");
    screen.innerHTML="No memories yet 💔"
  }

  const isSpecialTemplate = ["valentine", "epic", "anniversary"].includes(data.template);

  window.nextMemory=function(){
    if(!images.length || puzzleActive) return
    
    hasViewedOthers = true;
    index++
    if(index>=images.length) index=0
    
    updateDisplay();
  }

  window.prevMemory=function(){
    if(!images.length || puzzleActive) return
    
    hasViewedOthers = true;
    index--
    if(index<0) index=images.length-1
    
    updateDisplay();
  }

  function updateDisplay(skipFade = false) {
    if(!skipFade) img.style.opacity="0"
    
    const delay = skipFade ? 0 : 200;
    setTimeout(()=>{
      img.src=images[index]
      img.style.opacity="1"

      // Trigger puzzle on last image for special templates
      const continueBtn = document.querySelector("#stage3 button[onclick*='nextStage']");
      if(continueBtn && isSpecialTemplate && !puzzleSolved && currentStage === 3) {
         
         // Only hide continue button and trigger puzzle on the FINAL image
         if(index === images.length - 1 && images.length > 0) {
            continueBtn.style.display = "none";
            
            if(lastTriggeredIndex !== index) {
                // Determine if we should wait longer (e.g. if they just loaded a 1-image story)
                const isInstantShuffle = (images.length === 1 && !hasViewedOthers);
                const gazeTime = isInstantShuffle ? 8000 : 4000; 
                
                lastTriggeredIndex = index;
                setTimeout(() => {
                    // Only trigger if we are STILL on the memory stage!
                    if(index === images.length - 1 && !puzzleSolved && currentStage === 3) {
                        startPuzzle();
                    }
                }, gazeTime);
            }
         } else {
            continueBtn.style.display = "inline-block";
         }
      }
    }, delay);
  }
  window.checkPuzzleTrigger = updateDisplay;

  function startPuzzle() {
    puzzleActive = true;
    if(slideshowInterval) clearInterval(slideshowInterval);
    
    // Create an overlay
    const overlay = document.createElement("div");
    overlay.style = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; border-radius:20px; transition:0.5s;";
    overlay.innerHTML = `<h2 style="color:gold;">Puzzle Challenge! 🧩</h2><p>Solve this memory to continue...</p>`;
    screen.style.position = "relative";
    screen.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        renderPuzzle(images[index]);
      }, 500);
    }, 2000);
  }

  function renderPuzzle(imgUrl) {
    screen.innerHTML = "";
    screen.style.display = "grid";
    screen.style.gridTemplateColumns = "repeat(3, 1fr)";
    screen.style.gridTemplateRows = "repeat(3, 1fr)";
    screen.style.gap = "4px";
    screen.style.background = "#000";
    screen.style.padding = "4px";
    screen.style.position = "relative"; // For absolute reference img
    
    // Add reference image as a guide in the top-right (as requested)
    const refImg = document.createElement("img");
    refImg.id = "puzzleRefImg";
    refImg.src = imgUrl;
    // Positioned fixed to match the top-right "white line" area in the screenshot
    refImg.style.cssText = "position:fixed; top:100px; right:30px; width:140px; height:140px; border:3px solid white; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); z-index:10001; cursor:pointer; transition:0.3s; object-fit:cover;";
    refImg.title = "Reference - Click to toggle size";
    refImg.onclick = () => {
        const isSmall = refImg.style.width === "140px";
        refImg.style.width = isSmall ? "300px" : "140px";
        refImg.style.height = isSmall ? "300px" : "140px";
    };
    document.body.appendChild(refImg);

    const pieces = [];
    for(let i=0; i<9; i++) pieces.push(i);
    
    // Shuffle pieces (True random for swap style)
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    const tiles = [];
    let selectedTile = null;

    pieces.forEach((pieceIdx, currentPos) => {
      const tile = document.createElement("div");
      tile.className = "puzzle-tile tile-breaking";
      
      tile.style.setProperty("--tx", (Math.random() * 400 - 200) + "px");
      tile.style.setProperty("--ty", (Math.random() * 400 - 200) + "px");
      tile.style.setProperty("--tr", (Math.random() * 360) + "deg");
      tile.style.animationDelay = (currentPos * 0.05) + "s";

      tile.style.width = "100%";
      tile.style.height = "100%";
      tile.style.backgroundImage = `url(${imgUrl})`;
      
      // ASPECT RATIO FIX: Ensure image covers tile without extreme distortion
      tile.style.backgroundSize = "300% 300%"; 
      tile.style.backgroundRepeat = "no-repeat";
      
      const row = Math.floor(pieceIdx / 3);
      const col = pieceIdx % 3;
      
      const xPos = col === 0 ? "0%" : col === 1 ? "50%" : "100%";
      const yPos = row === 0 ? "0%" : row === 1 ? "50%" : "100%";
      
      tile.style.backgroundPosition = `${xPos} ${yPos}`;

      
      tile.dataset.pieceIdx = pieceIdx;
      tile.dataset.currentPos = currentPos;

      tile.onclick = () => {
        if (selectedTile === tile) {
            tile.style.border = "none";
            tile.style.boxShadow = "none";
            selectedTile = null;
            return;
        }

        if (!selectedTile) {
            selectedTile = tile;
            tile.style.border = "2px solid #ff4d6d";
            tile.style.boxShadow = "0 0 15px #ff4d6d";
        } else {
            // Swap logic
            swapTiles(selectedTile, tile);
            selectedTile.style.border = "none";
            selectedTile.style.boxShadow = "none";
            selectedTile = null;
            checkSolved();
        }
      };

      tiles.push(tile);
      screen.appendChild(tile);
    });

    function swapTiles(t1, t2) {
      const bgP1 = t1.style.backgroundPosition;
      const idx1 = t1.dataset.pieceIdx;
      
      t1.style.backgroundPosition = t2.style.backgroundPosition;
      t1.dataset.pieceIdx = t2.dataset.pieceIdx;
      
      t2.style.backgroundPosition = bgP1;
      t2.dataset.pieceIdx = idx1;
      
      t1.style.transform = "scale(0.9)";
      t2.style.transform = "scale(0.9)";
      setTimeout(() => {
          t1.style.transform = "scale(1)";
          t2.style.transform = "scale(1)";
      }, 100);
    }

    function checkSolved() {
      // The visual grid position is determined purely by DOM order.
      // So we must check if the current visual DOM elements have the correct pieceIdx in sequence.
      const currentVisualOrder = Array.from(screen.children);
      const isSolved = currentVisualOrder.every((tile, index) => {
          return parseInt(tile.dataset.pieceIdx) === index;
      });

      if (isSolved) {
        puzzleActive = false;
        puzzleSolved = true;
        screen.style.gap = "0";
        screen.style.padding = "0";
        Array.from(screen.children).forEach(t => t.style.border = "none");
        
        // Remove reference image
        const ref = document.getElementById("puzzleRefImg");
        if(ref) ref.remove();
        
        // Use an un-failable fallback robust selector for the button in case templates rename it
        let continueBtn = document.querySelector("#stage3 button[onclick*='nextStage']");
        if (!continueBtn) {
            const allBtns = document.querySelectorAll("#stage3 button");
            allBtns.forEach(b => {
                const txt = b.innerText.toLowerCase();
                if (txt.includes("continue") || txt.includes("next step") || txt.includes("reveal")) {
                    continueBtn = b;
                }
            });
        }
        
        if(continueBtn) {
            continueBtn.style.display = "block";
            continueBtn.style.visibility = "visible";
            continueBtn.classList.add("lovePulse");
        }

        
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    }
  }

  // Auto slideshow
  slideshowInterval = setInterval(()=>{
    if(!images.length || puzzleActive || puzzleSolved) return
    
    // Auto-slideshow counts as viewing others for trigger logic
    if(images.length > 1) hasViewedOthers = true;
    
    index++
    if(index>=images.length) index=0
    updateDisplay();
  },5000)
}

/* =========================================
AUDIO VISUALIZATION (WaveSurfer.js)
========================================= */

async function loadWaveSurfer() {
  if (window.WaveSurfer) return window.WaveSurfer;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/wavesurfer.js@7";
    script.onload = () => resolve(window.WaveSurfer);
    document.head.appendChild(script);
  });
}

async function initVoices(data){
  if(!data.voices || !data.voices.length) return;

  const container = document.getElementById("voiceContainer");
  if(!container) return;

  container.innerHTML = "<p style='text-align:center; opacity:0.7;'>Loading Audio... 🎶</p>";
  
  const WaveSurfer = await loadWaveSurfer();
  
  container.innerHTML = "";
  if(!window.allWavesurfers) window.allWavesurfers = [];

  data.voices.forEach((voiceUrl, i) => {
    const player = document.createElement("div");
    player.className = "voice-player";

    player.innerHTML = `
      <div class="player-top">
        <button class="play-btn" id="play-${i}">
          <span class="icon">▶</span>
        </button>
        <div class="voice-info">
          <span class="voice-title">Voice Message ${i + 1}</span>
          <span class="voice-time" id="time-${i}">0:00 / 0:00</span>
        </div>
      </div>
      <div class="waveform-wrapper" id="waveform-${i}" style="margin-top:10px;"></div>
    `;

    container.appendChild(player);

    const playBtn = player.querySelector(".play-btn");
    const icon = playBtn.querySelector(".icon");
    const timeDisplay = player.querySelector(".voice-time");

    function formatTime(s) {
      if (!s || isNaN(s)) return "0:00";
      const m = Math.floor(s / 60);
      const ss = Math.floor(s % 60);
      return `${m}:${ss.toString().padStart(2, '0')}`;
    }

    const wavesurfer = WaveSurfer.create({
      container: `#waveform-${i}`,
      waveColor: 'rgba(255, 255, 255, 0.4)',
      progressColor: '#ff4d6d',
      url: voiceUrl,
      height: 40,
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 0,
      normalize: true
    });

    wavesurfer.on('ready', (duration) => {
      timeDisplay.innerText = `0:00 / ${formatTime(duration)}`;
    });

    wavesurfer.on('audioprocess', (currentTime) => {
      timeDisplay.innerText = `${formatTime(currentTime)} / ${formatTime(wavesurfer.getDuration())}`;
    });

    wavesurfer.on('finish', () => {
      icon.innerText = "▶";
      if(window.duckBGM) window.duckBGM(false); // Restore BGM volume
    });

    playBtn.onclick = () => {
      // pause all others
      window.allWavesurfers.forEach((ws, idx) => {
        if(idx !== i && ws.isPlaying()) {
           ws.pause();
           const otherPlay = document.getElementById(`play-${idx}`);
           if(otherPlay) otherPlay.querySelector(".icon").innerText = "▶";
        }
      });
      
      wavesurfer.playPause();
      if(wavesurfer.isPlaying()) {
        icon.innerText = "⏸";
        if(window.duckBGM) window.duckBGM(true); // Duck BGM volume
        if(typeof spawnHearts === "function") spawnHearts();
      } else {
        icon.innerText = "▶";
        if(window.duckBGM) window.duckBGM(false); // Restore BGM volume
      }
    };

    window.allWavesurfers[i] = wavesurfer;
  });
}

/* =========================================
SCRATCH-OFF STAGE (Stage 1.5/5.5 dynamic)
========================================= */

function initScratch(data) {
  if (!data.scratchMessage) return;

  const stage = document.createElement("div");
  stage.className = "stage";
  stage.id = "stagescratch";

  stage.innerHTML = `
    <div class="card">
      <h2>Secret Reveal 🎫</h2>
      <p style="opacity:0.8; margin-bottom:20px;">Use your finger to scratch and reveal!</p>
      
      <div style="position:relative; width:100%; max-width:300px; height:150px; margin:0 auto; border-radius:15px; overflow:hidden; box-shadow:0 10px 20px rgba(0,0,0,0.2);">
        <div style="position:absolute; width:100%; height:100%; background:white; color:#ff4d6d; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; padding:20px; box-sizing:border-box;">
          ${data.scratchMessage}
        </div>
        <canvas id="scratchCanvas" width="300" height="150" style="position:absolute; top:0; left:0; width:100%; height:100%; cursor:crosshair;"></canvas>
      </div>

      <button id="scratchNextBtn" onclick="nextStage()" style="display:none; width:100%; margin-top:25px;">Continue 💖</button>
    </div>
  `;

  document.body.appendChild(stage);

  // Setup Canvas
  const canvas = document.getElementById("scratchCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  
  // Fill silver
  ctx.fillStyle = "#c0c0c0";
  ctx.fillRect(0, 0, 300, 150);
  
  // Pattern text
  ctx.fillStyle = "#a9a9a9";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Scratch Me!", 150, 80);

  let isDrawing = false;
  let scratched = 0;

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / (rect.right - rect.left) * canvas.width,
      y: (clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
  }

  function scratch(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const pos = getMousePos(e);
    
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    scratched++;
    if (scratched > 40) {
        const btn = document.getElementById("scratchNextBtn");
        if(btn) {
          btn.style.display = "block";
          btn.classList.add("fade-in");
        }
    }
  }

  canvas.addEventListener("mousedown", (e) => { isDrawing = true; scratch(e); });
  canvas.addEventListener("mousemove", scratch);
  canvas.addEventListener("mouseup", () => isDrawing = false);
  canvas.addEventListener("mouseleave", () => isDrawing = false);

  canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); }, {passive: false});
  canvas.addEventListener("touchmove", scratch, {passive: false});
  canvas.addEventListener("touchend", () => isDrawing = false);
}

/* =========================================
MINI-GAME: CATCH THE HEARTS (Stage 5.8 dynamic)
========================================= */

function initCatchGame(data) {
  if (data.plan !== "169" && data.plan !== "299") return;

  const stage = document.createElement("div");
  stage.className = "stage";
  stage.id = "stagecatchgame";

  stage.innerHTML = `
    <div class="card" style="min-height:350px; display:flex; flex-direction:column; justify-content:center; position:relative; overflow:hidden;">
      <h2 style="margin-top:0;">Catch My Heart 💖</h2>
      <p style="opacity:0.8; margin-bottom:10px;">Catch 10 falling hearts to unlock your final surprise!</p>
      
      <div id="catchArea" style="position:relative; width:100%; height:250px; border:2px dashed rgba(255,77,136,0.5); border-radius:15px; overflow:hidden; background:rgba(255,255,255,0.02);">
         <div id="catchScore" style="position:absolute; top:10px; right:15px; font-weight:bold; color:#ff4d6d; font-size:18px; z-index:10; background:rgba(255,255,255,0.8); padding:5px 10px; border-radius:10px;">0 / 10</div>
      </div>

      <button id="catchNextBtn" class="btn" onclick="nextStage()" style="display:none; width:100%; margin-top:20px;">Proceed to Finale ✨</button>
    </div>
  `;

  document.body.appendChild(stage);

  let score = 0;
  let heartInterval;
  let gameActive = false;

  const observer = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting && !gameActive) {
      gameActive = true;
      startGame();
    }
  });
  observer.observe(stage);

  function startGame() {
    const area = document.getElementById("catchArea");
    if(!area) return;

    // Throttle spawn rate for low-end devices
    const spawnRate = Optimization.isLowEnd ? 1100 : 700;

    heartInterval = setInterval(() => {
        if (score >= 10) {
          clearInterval(heartInterval);
          return;
        }

        const isHeartbreak = Math.random() < 0.2;
        const heartContainer = document.createElement("div");
        
        // LARGE HITBOX for easier mobile play
        heartContainer.style.cssText = `
          position: absolute;
          left: ${Math.random() * 80 + 5}%;
          top: -60px;
          padding: 20px;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
          transition: transform 2.8s linear;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        `;
        
        const emoji = document.createElement("span");
        emoji.innerHTML = isHeartbreak ? "💔" : ["💖", "💗", "💕", "💞", "💘"][Math.floor(Math.random()*5)];
        emoji.style.fontSize = "32px";
        heartContainer.appendChild(emoji);
        
        const tapHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if(isHeartbreak) {
            if(navigator.vibrate) navigator.vibrate(100); // Strong vibrate for heartbreak
            score = 0;
            const scoreEl = document.getElementById("catchScore");
            if(scoreEl) {
               scoreEl.innerText = "0 / 10";
               scoreEl.style.color = "red";
               scoreEl.style.transform = "scale(1.2)";
               setTimeout(() => {
                  scoreEl.style.color = "#ff4d6d";
                  scoreEl.style.transform = "scale(1)";
               }, 500);
            }
            heartContainer.remove();
            return;
          }

          score++;
          if(navigator.vibrate) navigator.vibrate(30); // Soft vibrate for catch
          const scoreEl = document.getElementById("catchScore");
          if(scoreEl) scoreEl.innerText = score + " / 10";
          
          // Position of pop relative to container
          const rect = heartContainer.getBoundingClientRect();
          const areaRect = area.getBoundingClientRect();
          
          heartContainer.remove();
          
          // POP EFFECT (non-blocking)
          const pop = document.createElement("div");
          pop.innerHTML = "✨";
          pop.style.cssText = `
            position: absolute;
            left: ${rect.left - areaRect.left + 20}px;
            top: ${rect.top - areaRect.top + 20}px;
            font-size: 24px;
            pointer-events: none;
            animation: lovePulse 0.4s forwards;
          `;
          area.appendChild(pop);
          setTimeout(() => pop.remove(), 400);

          if(score >= 10) {
            clearInterval(heartInterval);
            const btn = document.getElementById("catchNextBtn");
            if(btn) {
               btn.style.display = "block";
               btn.classList.add("lovePulse");
            }
          }
        };

        heartContainer.addEventListener("mousedown", tapHandler);
        heartContainer.addEventListener("touchstart", tapHandler, {passive: false});

        area.appendChild(heartContainer);

        // GPU ACCELERATED ANIMATION
        requestAnimationFrame(() => {
          heartContainer.style.transform = "translateY(350px)";
        });

        setTimeout(() => {
          if(heartContainer.parentElement) heartContainer.remove();
        }, 3000);

    }, spawnRate);
  }
}

/* =========================================
PROPOSAL GAME
========================================= */

function initProposalGame(){
  let noClickCount = 0;

  const showMonkey = () => {
    const noBtn = document.getElementById("noBtn");
    if(!noBtn) return;
    
    let monkey = document.getElementById("monkeyVideo");
    if(!monkey) {
      monkey = document.createElement("video");
      monkey.id = "monkeyVideo";
      monkey.autoplay = true;
      monkey.loop = true;
      monkey.muted = true; 
      monkey.playsInline = true; 
      monkey.className = "monkey-gif fade-in";
      monkey.style.cssText = "width:200px; max-width:80%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1000; border-radius:15px; box-shadow:0 15px 40px rgba(0,0,0,0.6); pointer-events:none; display:none;";
      const card = noBtn.closest(".card");
      if(card) {
          card.style.position = "relative";
          card.appendChild(monkey);
      }
    }
    
    // Switch source based on click count
    const src = noClickCount >= 2 ? "assets/monkey2.mp4" : "assets/monkey.mp4";
    if(monkey.src.indexOf(src) === -1) {
        monkey.src = src;
        monkey.load();
    }

    if(monkey) {
        monkey.style.display = "block";
        monkey.play().catch(e => console.log("Video play failed", e));
    }
  };

  const moveNoBtn = () => {
    const noBtn = document.getElementById("noBtn");
    const yesBtn = document.getElementById("yesBtn");
    if(!noBtn || !yesBtn) return;

    const card = noBtn.closest(".card");
    const rect = card ? card.getBoundingClientRect() : { top:0, left:0, bottom:0, right:0 };
    
    let x, y;
    let safe = false;
    let attempts = 0;

    while(!safe && attempts < 20) {
      x = Math.random() * (window.innerWidth - 120);
      y = Math.random() * (window.innerHeight - 80);
      
      // Check if this position overlaps with the gift card area
      const btnRect = { left: x, top: y, right: x + 120, bottom: y + 80 };
      const overlaps = !(btnRect.right < rect.left || 
                         btnRect.left > rect.right || 
                         btnRect.bottom < rect.top || 
                         btnRect.top > rect.bottom);
      
      if(!overlaps) safe = true;
      attempts++;
    }

    noBtn.style.position = "fixed";
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
    noBtn.style.zIndex = "2000"; // Highest z-index to stay on top

    yesScale += 0.2;
    yesBtn.style.transform = `scale(${yesScale})`;
    
    noClickCount++;
    showMonkey();
  };

  // Removed mouseover listener as per request - only click triggers it now
  
  document.addEventListener("click", function(e){
    if(e.target && e.target.id === "noBtn") moveNoBtn();

    /* SAFARI/MOBILE SCALED CLICK FIX */
    if(window.yesScale > 1) {
      const yesBtn = document.getElementById("yesBtn")
      if (yesBtn && e.target && e.target.id !== "yesBtn") {
        const rect = yesBtn.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          if(typeof window.celebrate === "function") window.celebrate();
        }
      }
    }
  });

}

/* =========================================
FINAL CELEBRATION
========================================= */

window.celebrate=function(){

const finalQ = document.getElementById("finalQuestion");
if(finalQ) {
  const messages = {
    valentine: "FOR YOU CUTIE😘",
    forgiveness: "IM SORRY CUTIE 🥺",
    epic: "YOU'RE MY EVERYTHING 💖",
    anniversary: "HAPPY ANNIVERSARY MY LOVE 💍",
    birthday: "HAPPIEST BIRTHDAY 🎂"
  };
  const template = window.storyData?.template || "valentine";
  finalQ.innerText = messages[template] || "FOR YOU CUTIE😘";
  
  finalQ.style.fontFamily = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  finalQ.style.fontWeight = "bold";
}

const ring=document.getElementById("ring")
const yesBtn=document.getElementById("yesBtn")
const noBtn=document.getElementById("noBtn")

if(ring){
ring.classList.add("show")
}

if(yesBtn) yesBtn.style.display = "none"
if(noBtn) noBtn.style.display = "none"

// Remove Monkey reaction video upon Yes
const monkey = document.getElementById("monkeyVideo") || document.getElementById("monkeyGif");
if(monkey) monkey.remove();

confetti({
particleCount:250,
spread:140
})

if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]); // Celebration pattern

  const fireworks = new Fireworks.default(document.body, {
    speed: 3,
    particles: 120,
    trace: 3
  });
  fireworks.start();

  // =========================================
  // WEBRTC REACTION CAPTURE
  // =========================================
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    // Show a subtle recording indicator
    const recIndicator = document.createElement("div");
    recIndicator.innerHTML = "🔴 REC";
    recIndicator.style.cssText = "position:fixed; top:20px; right:20px; background:rgba(255,0,0,0.8); color:white; padding:5px 12px; border-radius:15px; font-size:12px; font-weight:bold; z-index:9999; box-shadow:0 0 10px red; transition:0.3s;";
    document.body.appendChild(recIndicator);
    
    // Animate blink
    const blink = setInterval(() => { recIndicator.style.opacity = recIndicator.style.opacity === "1" ? "0.5" : "1"; }, 800);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        // Try to use a widely supported codec
        let options = { mimeType: 'video/webm' };
        if (!MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/mp4' };
        }
        
        const mediaRecorder = new MediaRecorder(stream, options);
        const chunks = [];
        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
           clearInterval(blink);
           recIndicator.style.opacity = "1";
           recIndicator.style.background = "#25D366";
           recIndicator.style.boxShadow = "none";
           recIndicator.innerHTML = "✨ Uploading...";
           
           const blob = new Blob(chunks, { type: options.mimeType });
           const formData = new FormData();
           formData.append("file", blob);
           formData.append("upload_preset", "only4you");
           
           try {
             // Upload video to Cloudinary directly from client to save Render bandwidth
             const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dsziyn4tp/video/upload", {
               method: "POST",
               body: formData
             });
             const cloudData = await cloudRes.json();
             
             // Save URL via backend endpoint
             if(cloudData.secure_url) {
               await fetch("https://only4you-backend.onrender.com/add-reaction", {
                 method: "POST",
                 headers: {"Content-Type": "application/json"},
                 body: JSON.stringify({ id: id, reactionUrl: cloudData.secure_url })
               });
               recIndicator.innerHTML = "💖 Reaction Sent!";
             } else {
               recIndicator.remove();
             }
           } catch(e) {
             console.error("Reaction upload failed", e);
             recIndicator.remove();
           }
           
           setTimeout(() => recIndicator.remove(), 3000);
           stream.getTracks().forEach(t => t.stop());
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Record 8 seconds of their face reacting to the fireworks/message
        setTimeout(() => {
          if(mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }, 8000); 
        
      })
      .catch(err => {
         console.warn("Reaction capture skipped or denied by user", err);
         clearInterval(blink);
         recIndicator.remove();
      });
  }
}


/* =========================================
LOVE QUIZ (STAGE 5)
========================================= */

let quizAnswers = {}

function initQuiz(data){
  if(!data.quiz || data.quiz.length === 0) return;
  
  // Preload existing answers to prevent overwriting during updateDoc
  quizAnswers = data.quizAnswers || {};
  
  const container = document.getElementById("quizContainer");
  if(!container) return;

  container.innerHTML = "";
  
  data.quiz.forEach((q, qIndex) => {
    const qBox = document.createElement("div");
    qBox.className = "quiz-box";
    qBox.innerHTML = `<h3 style="margin-bottom:18px; color:#ff4d6d; font-size:1.1rem; font-family:sans-serif; line-height:1.4; letter-spacing:0.5px;">${q.question}</h3>`;
    
    const optGrid = document.createElement("div");
    optGrid.style.display = "grid";
    optGrid.style.gap = "12px";

    q.options.forEach((opt, oIndex) => {
      if(!opt.trim()) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-opt";
      btn.innerText = opt;
      
      // Restore selected state if answer already exists
      if(quizAnswers[qIndex] === opt) {
        btn.classList.add("selected");
      }
      
      btn.onclick = () => selectOption(qIndex, oIndex, btn, qBox);
      optGrid.appendChild(btn);
    });

    qBox.appendChild(optGrid);
    container.appendChild(qBox);
  });

  // Hide the next stage button initially
  let nextBtn = document.querySelector("#stage5 button[onclick*='nextStage']");
  if(nextBtn) nextBtn.style.display = "none";

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "stage-continue-btn";
  submitBtn.innerText = "Submit Quiz 📝";
  submitBtn.style.marginTop = "20px";
  
  submitBtn.onclick = () => {
    const answeredCount = Object.keys(quizAnswers).length;
    if(answeredCount < data.quiz.length) {
      alert(`Please answer all ${data.quiz.length} questions first! 💕`);
      return;
    }
    
    // Show the real next button and hide submit
    if(nextBtn) {
      nextBtn.style.display = "block";
      nextBtn.className = "stage-continue-btn";
      nextBtn.innerText = "Final Step ➡";
    }
    submitBtn.style.display = "none";
    
    // Final save just in case
    saveQuizAnswers("completion", "done");
    spawnHearts();
  };

  container.appendChild(submitBtn);

  // If already fully answered (reloaded), show nextBtn immediately
  if(Object.keys(quizAnswers).length >= data.quiz.length) {
     if(nextBtn) nextBtn.style.display = "block";
     submitBtn.style.display = "none";
  }
}

function selectOption(qIndex, oIndex, btn, qBox){
  // Deselect others in this box
  qBox.querySelectorAll(".quiz-opt").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  
  const answerValue = btn.innerText;
  quizAnswers[qIndex] = answerValue; // ← update local state too
  saveQuizAnswers(qIndex, answerValue);
  spawnHearts();
}

async function saveQuizAnswers(qIndex, answerValue){
  const id = new URLSearchParams(window.location.search).get("id");
  if(!id) {
    console.error("❌ No surprise ID in URL — cannot save quiz answer.");
    return;
  }
  
  try {
    const response = await fetch("https://only4you-backend.onrender.com/save-quiz-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, qIndex, answerValue: answerValue })
    });
    const result = await response.json();
    if(result.success) {
      console.log(`✅ Quiz answer ${qIndex} saved: ${answerValue}`);
    } else {
      console.error("❌ Backend rejected quiz save:", result.error);
    }
  } catch(e) {
    console.error("❌ Failed to reach backend:", e.message);
  }
}
