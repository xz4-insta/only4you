/* =========================================
EPIC STAGE ENGINE v3
Premium Interactive Story Engine
========================================= */

let currentStage = 1
const totalStages = 6
let love = 0
let yesScale = 1

/* =========================================
PLAN LOCK SYSTEM
========================================= */

export function applyStageLocking(plan){

const stageFlow = {
"48":[1,6],
"89":[1,2,3,6],
"169":[1,2,3,4,6],
"299":[1,2,3,4,5,6]
}

window.allowedStages = stageFlow[plan] || [1,6]

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

for(let i=0;i<5;i++){

const heart=document.createElement("div")

heart.innerHTML="💖"
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
let images=data.images || []

const img=document.createElement("img")
img.style.width="100%"
img.style.height="100%"
img.style.objectFit="cover"
img.style.borderRadius="20px"
img.style.transition="opacity 0.4s ease"

screen.innerHTML=""

if(images.length){
img.src=images[0]
screen.appendChild(img)
}else{
screen.innerHTML="No memories yet 💔"
}

/* always define buttons */

window.nextMemory=function(){

if(!images.length) return

index++
if(index>=images.length) index=0

img.style.opacity="0"

setTimeout(()=>{
img.src=images[index]
img.style.opacity="1"
},200)

}

window.prevMemory=function(){

if(!images.length) return

index--
if(index<0) index=images.length-1

img.style.opacity="0"

setTimeout(()=>{
img.src=images[index]
img.style.opacity="1"
},200)

}



/* auto slideshow */

setInterval(()=>{

if(!images.length) return

index++
if(index>=images.length) index=0

img.style.opacity="0"

setTimeout(()=>{
img.src = images[index]
img.style.opacity="1"
},200)

},3500)
}

function initVoices(data){

if(!data.voices || !data.voices.length) return

const container = document.getElementById("voiceContainer")
if(!container) return

container.innerHTML = ""

data.voices.forEach((voice,i)=>{

const btn = document.createElement("button")
btn.className = "voiceBtn"
btn.innerText = "▶ Play Voice " + (i+1)

btn.onclick = function(){

const audio = new Audio(voice)
audio.play()

spawnHearts()

}

container.appendChild(btn)

})

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

const fireworks=new Fireworks.default(document.body,{
speed:3,
particles:120,
trace:3
})

fireworks.start()

}