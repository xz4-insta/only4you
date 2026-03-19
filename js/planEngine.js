export function applyPlanFeatures(plan, data, isOwner, id){

  const card = document.querySelector(".card");
  const bodyStyle = getComputedStyle(document.body).background || "";

  /* ===================================================
     BASIC – 48 (Subtle Upgrade Pressure)
  =================================================== */
  /* ===================================================
   BASIC – 48 (Locked + Upgrade CTA)
=================================================== */

if(plan === "48"){

  const upgradeBar = document.createElement("div");

  upgradeBar.style.position = "fixed";
  upgradeBar.style.bottom = "0";
  upgradeBar.style.left = "0";
  upgradeBar.style.width = "100%";
  upgradeBar.style.background = "linear-gradient(90deg,#ff4d6d,#ff8fab)";
  upgradeBar.style.color = "white";
  upgradeBar.style.padding = "16px";
  upgradeBar.style.display = "flex";
  upgradeBar.style.justifyContent = "center";
  upgradeBar.style.alignItems = "center";
  upgradeBar.style.gap = "20px";
  upgradeBar.style.fontWeight = "600";
  upgradeBar.style.boxShadow = "0 -4px 20px rgba(0,0,0,0.4)";
  upgradeBar.style.zIndex = "999";

  upgradeBar.innerHTML = `
    <span>🔒 Unlock floating hearts, music & luxury effects</span>
    <button id="upgradeBtn"
      style="
        background:white;
        color:#ff4d6d;
        border:none;
        padding:8px 18px;
        border-radius:20px;
        font-weight:600;
        cursor:pointer;
        transition:0.3s;
      ">
      Upgrade Now 💎
    </button>
  `;

  document.body.appendChild(upgradeBar);

  document.getElementById("upgradeBtn").onclick = () => {

    let nextPlan = "89";

    if(window.currentPlan === "89") nextPlan = "169";
    if(window.currentPlan === "169") nextPlan = "299";

    window.location.href = `create.html?plan=${nextPlan}&upgrade=true&id=${id}`;
  };

  return; // stop features for 48
}

  /* ===================================================
     89 – FLOATING HEARTS + SHIMMER
  =================================================== */

  for(let i=0;i<20;i++){
    const heart=document.createElement("div");
    heart.innerHTML="💖";
    heart.style.position="fixed";
    heart.style.left=Math.random()*100+"%";
    heart.style.bottom="-20px";
    heart.style.opacity="0.25";
    heart.style.fontSize="18px";
    heart.style.pointerEvents="none";
    heart.style.animation=`floatHearts ${6+Math.random()*4}s linear infinite`;
    document.body.appendChild(heart);
  }

  if(card){
    const shimmer=document.createElement("div");
    shimmer.style.position="absolute";
    shimmer.style.top="0";
    shimmer.style.left="-100%";
    shimmer.style.width="50%";
    shimmer.style.height="100%";
    shimmer.style.background="linear-gradient(120deg,transparent,rgba(255,255,255,0.4),transparent)";
    shimmer.style.animation="shimmer 4s infinite";
    shimmer.style.pointerEvents="none";
    card.appendChild(shimmer);
  }

  /* ===================================================
     169 – DEPTH + PREMIUM FEEL
  =================================================== */

 if(plan==="169" || plan==="299"){

  const audio=document.createElement("audio");
  audio.src="music/romantic.mp3";
  audio.loop=true;
  audio.volume=0;

  audio.addEventListener("error", ()=>{
    console.warn("Music file not found or unsupported.");
  });

  document.body.appendChild(audio);

  document.addEventListener("click",()=>{
    audio.play().catch(()=>{});
    let fade=setInterval(()=>{
      if(audio.volume<0.3){
        audio.volume+=0.01;
      }else{
        clearInterval(fade);
      }
    },100);
  },{once:true});
}

if(plan === "299"){

  const card = document.querySelector(".card");

  /* Detect dominant body background */
  const bg = getComputedStyle(document.body).background;

  /* Create soft gold overlay */
  const goldOverlay = document.createElement("div");
  goldOverlay.style.position = "fixed";
  goldOverlay.style.top = "0";
  goldOverlay.style.left = "0";
  goldOverlay.style.width = "100%";
  goldOverlay.style.height = "100%";
  goldOverlay.style.pointerEvents = "none";
  goldOverlay.style.zIndex = "0";

  /* Blend gold differently depending on light/dark background */
  if(bg.includes("rgb(0") || bg.includes("linear-gradient(135deg,#1f1c2c")){
    // Dark dominant
    goldOverlay.style.background =
      "radial-gradient(circle at center, rgba(255,215,0,0.25), transparent 60%)";
  } else {
    // Light / Pink dominant
    goldOverlay.style.background =
      "radial-gradient(circle at center, rgba(255,182,193,0.35), rgba(255,215,0,0.25), transparent 70%)";
  }

  document.body.appendChild(goldOverlay);

  /* Premium card glow */
  if(card){
    card.style.boxShadow =
      "0 0 40px rgba(255,215,0,0.6), 0 0 100px rgba(255,215,0,0.3)";
    card.style.border = "1px solid rgba(255,215,0,0.5)";
  }

  /* Auto-adaptive badge */
  const badge = document.createElement("div");
  badge.innerHTML="💍 FOREVER PREMIUM";
  badge.style.position="fixed";
  badge.style.top="20px";
  badge.style.right="20px";
  badge.style.padding="10px 22px";
  badge.style.borderRadius="30px";
  badge.style.fontWeight="600";
  badge.style.zIndex="999";

  if(bg.includes("rgb(0") || bg.includes("linear-gradient(135deg,#1f1c2c")){
    badge.style.background="linear-gradient(90deg,gold,#fff5c3)";
    badge.style.color="black";
  } else {
    badge.style.background="linear-gradient(90deg,#ffb6c1,gold)";
    badge.style.color="white";
  }

  badge.style.boxShadow="0 0 25px rgba(255,215,0,0.8)";
  document.body.appendChild(badge);
}
/* ================= CINEMATIC LUXURY PARTICLE SYSTEM ================= */
function spawnLuxuryParticle(){

  const symbols = ["✨","🌸","💖","🌺","⭐","🌷"];
  const el = document.createElement("div");

  const randomSymbol = symbols[Math.floor(Math.random()*symbols.length)];
  el.innerHTML = randomSymbol;

  const depth = Math.random();
  const duration = 6 + Math.random()*8;   // ✅ DECLARE FIRST
  const drift = (Math.random() - 0.5) * 200;

  el.style.position = "fixed";
  el.style.left = Math.random()*100 + "%";
  el.style.top = "-40px";
  el.style.fontSize = (14 + depth*24) + "px";
  el.style.opacity = (0.3 + depth*0.7);
  el.style.pointerEvents = "none";
  el.style.zIndex = depth > 0.5 ? "3" : "1";
  el.style.textShadow = "0 0 10px rgba(255,215,0,0.8)";

  el.style.setProperty("--drift", drift + "px");

  /* ✅ Decide animation AFTER duration exists */
  if(randomSymbol === "🌸" || randomSymbol === "🌺" || randomSymbol === "🌷"){
    el.style.animation = `luxuryPetal ${duration}s ease-in forwards`;
  } else {
    el.style.animation = `luxuryFall ${duration}s cubic-bezier(.42,.0,.58,1) forwards`;
  }

  document.body.appendChild(el);

  setTimeout(()=>{
    el.remove();
  }, duration * 1000);
}

if(plan === "299"){

setInterval(() => {
   spawnLuxuryParticle();
}, 250);

setInterval(()=>{
  spawnLuxuryParticle();
  if(Math.random() > 0.5){
    spawnLuxuryParticle();
  }
}, 300);

}
    /* Dark Template Enhancement */
    if(bodyStyle.includes("#1f1c2c") || bodyStyle.includes("928DAB")){
      document.body.style.boxShadow="inset 0 0 200px rgba(255,215,0,0.25)";
    }

    /* Smooth Heading Reveal */
    const heading=document.querySelector("h1");
    if(heading){
      const fullText=heading.innerText;
      heading.innerText="";
      let i=0;
      function type(){
        if(i<fullText.length){
          heading.innerText+=fullText.charAt(i);
          i++;
          setTimeout(type,40);
        }
      }
      type();
    }

    /* Soft Pulse Background Glow */
    const pulse=document.createElement("div");
    pulse.style.position="fixed";
    pulse.style.top="0";
    pulse.style.left="0";
    pulse.style.width="100%";
    pulse.style.height="100%";
    pulse.style.pointerEvents="none";
    pulse.style.background="radial-gradient(circle, rgba(255,215,0,0.15), transparent 70%)";
    pulse.style.animation="fadePulse 3s infinite alternate";
    document.body.appendChild(pulse);

    const style=document.createElement("style");
    style.innerHTML=`
      @keyframes fadePulse{
        from{opacity:0.4;}
        to{opacity:0.8;}
      }
    `;
    document.head.appendChild(style);
  }
