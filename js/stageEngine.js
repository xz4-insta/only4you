import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Bypassing Lock for Creator/Admin session
const raw = localStorage.getItem("_u4y_preview_lock");
let isCreator = false;
try {
  const session = JSON.parse(raw);
  if(session && session.active && session.expiry > Date.now()) isCreator = true;
} catch(e){}

if(isCreator) {
  window.allowedStages = [1,2,3,4,5,6];
} else {
  window.allowedStages = stageFlow[plan] || [1,6];
}

}


/* =========================================
INIT ENGINE
========================================= */

export function initEpicInteractions(data){
window.storyData = data

initProgressDots()
initLetter(data)
initMemories(data)
initVoices(data)
initQuiz(data)
initProposalGame()
initTransitions()

showStage(1)

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

tvStaticTransition(()=>{
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

tvStaticTransition(()=>{
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

const staticDiv=document.createElement("div")
staticDiv.className="tv-static"
document.body.appendChild(staticDiv)

window.tvStatic = staticDiv

}

function tvStaticTransition(callback){

if(!window.tvStatic){
callback()
return
}

window.tvStatic.style.opacity=1

setTimeout(()=>{

window.tvStatic.style.opacity=0
callback()

},300)

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

if(i+1===currentStage){
d.classList.add("active")
}

})

}

/* =========================================
LETTER SYSTEM
========================================= */

function initLetter(data){

window.openLetter=function(){

const flap=document.querySelector(".flap")
const letter=document.getElementById("letterContent")

if(!flap || !letter) return

flap.style.transform="rotateX(180deg)"
letter.style.bottom="0"

}

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

  for(let i=0;i<5;i++){
    const heart=document.createElement("div")
    heart.innerHTML=emoji;
    heart.className="floatHeart"
    heart.style.left=(window.innerWidth/2+(Math.random()*120-60))+"px"
    heart.style.top=(window.innerHeight/2)+"px"
    document.body.appendChild(heart)
    setTimeout(()=>heart.remove(),1000)
  }
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
      if(continueBtn && isSpecialTemplate && !puzzleSolved) {
         
         // Only hide continue button and trigger puzzle on the FINAL image
         if(index === images.length - 1 && images.length > 0) {
            continueBtn.style.display = "none";
            
            if(lastTriggeredIndex !== index) {
                // Determine if we should wait longer (e.g. if they just loaded a 1-image story)
                const isInstantShuffle = (images.length === 1 && !hasViewedOthers);
                const gazeTime = isInstantShuffle ? 8000 : 4000; // 8s for single photo, 4s if they navigated here
                
                lastTriggeredIndex = index;
                setTimeout(() => {
                    if(index === images.length - 1 && !puzzleSolved) {
                        startPuzzle();
                    }
                }, gazeTime);
            }
         } else {
            // Show continue button for intermediate photos (sender/receiver can skip if they want)
            continueBtn.style.display = "inline-block";
         }
      }
    }, delay);
  }

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
      const isSolved = tiles.every((tile, index) => {
          // In swap mode, we compare pieceIdx to its current location in DOM (index)
          return parseInt(tile.dataset.pieceIdx) === index;
      });

      if (isSolved) {
        puzzleActive = false;
        puzzleSolved = true;
        screen.style.gap = "0";
        screen.style.padding = "0";
        tiles.forEach(t => t.style.border = "none");
        
        const continueBtn = document.querySelector("#stage3 button[onclick*='nextStage']");
        if(continueBtn) {
            continueBtn.style.display = "block";
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

function initVoices(data){
  if(!data.voices || !data.voices.length) return;

  const container = document.getElementById("voiceContainer");
  if(!container) return;

  container.innerHTML = "";

  data.voices.forEach((voiceUrl, i) => {
    const player = document.createElement("div");
    player.className = "voice-player";

    const audio = new Audio(voiceUrl);

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
      <div class="seek-wrapper">
        <input type="range" class="seek-bar" id="seek-${i}" value="0" min="0" max="100">
      </div>
    `;

    const playBtn = player.querySelector(".play-btn");
    const icon = playBtn.querySelector(".icon");
    const seekBar = player.querySelector(".seek-bar");
    const timeDisplay = player.querySelector(".voice-time");

    function formatTime(s) {
      if (!s || isNaN(s)) return "0:00";
      const m = Math.floor(s / 60);
      const ss = Math.floor(s % 60);
      return `${m}:${ss.toString().padStart(2, '0')}`;
    }

    playBtn.onclick = () => {
      const allIcons = container.querySelectorAll(".icon");
      const isPaused = audio.paused;

      // Pause all and reset all icons
      container.querySelectorAll('audio').forEach(a => a.pause());
      allIcons.forEach(i => i.innerText = "▶");

      if (isPaused) {
        audio.play();
        icon.innerText = "⏸";
        spawnHearts();
      } else {
        audio.pause();
        icon.innerText = "▶";
      }
    };

    audio.onloadedmetadata = () => {
      timeDisplay.innerText = `0:00 / ${formatTime(audio.duration)}`;
      seekBar.max = Math.floor(audio.duration);
    };

    audio.ontimeupdate = () => {
      seekBar.value = Math.floor(audio.currentTime);
      timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    };

    audio.onended = () => {
      icon.innerText = "▶";
      seekBar.value = 0;
    };

    seekBar.oninput = () => {
      audio.currentTime = seekBar.value;
    };

    container.appendChild(player);
  });
}

/* =========================================
PROPOSAL GAME
========================================= */

function initProposalGame(){

document.addEventListener("click",function(e){

if(e.target && e.target.id==="noBtn"){

const noBtn=document.getElementById("noBtn")
const yesBtn=document.getElementById("yesBtn")

if(!noBtn || !yesBtn) return

const x=Math.random()*(window.innerWidth-120)
const y=Math.random()*(window.innerHeight-80)

noBtn.style.position="fixed"
noBtn.style.left=x+"px"
noBtn.style.top=y+"px"

yesScale+=0.35
yesBtn.style.transform=`scale(${yesScale})`

return
}

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

})

}

/* =========================================
FINAL CELEBRATION
========================================= */

window.celebrate=function(){

const finalQ = document.getElementById("finalQuestion");
if(finalQ) finalQ.innerText = "FOR YOU CUTIE😘";

const ring=document.getElementById("ring")
const yesBtn=document.getElementById("yesBtn")
const noBtn=document.getElementById("noBtn")

if(ring){
ring.classList.add("show")
}

if(yesBtn) yesBtn.style.display = "none"
if(noBtn) noBtn.style.display = "none"

confetti({
particleCount:250,
spread:140
})

  const fireworks = new Fireworks.default(document.body, {
    speed: 3,
    particles: 120,
    trace: 3
  });
  fireworks.start();
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

  // Ensure "Final Step" button is consistent and visible
  let nextBtn = document.querySelector("#stage5 button[onclick*='nextStage']");
  if(nextBtn) {
    nextBtn.className = "stage-continue-btn";
    nextBtn.innerText = "Final Step ➡";
  }
}

function selectOption(qIndex, oIndex, btn, qBox){
  // Deselect others in this box
  qBox.querySelectorAll(".quiz-opt").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  
  const answerValue = btn.innerText;
  saveQuizAnswers(qIndex, answerValue);
  spawnHearts();
}

async function saveQuizAnswers(qIndex, answerValue){
  const id = new URLSearchParams(window.location.search).get("id");
  if(!id) return;
  
  try {
    const db = getFirestore();
    const ref = doc(db, "surprises", id);
    // Use dot-notation to update ONLY this specific question's answer
    // This prevents race conditions and overwriting other answers
    await updateDoc(ref, {
      [`quizAnswers.${qIndex}`]: answerValue
    });
  } catch(e) {
    console.error("Failed to save answer:", e);
  }
}
