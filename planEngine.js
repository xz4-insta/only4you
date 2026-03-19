export function applyPlanFeatures(plan, data, isOwner, id){

  /* ================= BASIC 48 ================= */
  if(plan === "48"){
    const lock = document.createElement("div");
    lock.style.position="fixed";
    lock.style.bottom="0";
    lock.style.left="0";
    lock.style.width="100%";
    lock.style.background="rgba(0,0,0,0.7)";
    lock.style.color="white";
    lock.style.padding="12px";
    lock.style.textAlign="center";
    lock.innerText="🔒 Upgrade to unlock premium effects";
    document.body.appendChild(lock);
  }

  /* ================= 89 FLOATING HEARTS ================= */
  if(plan !== "48"){
    for(let i=0;i<25;i++){
      const heart=document.createElement("div");
      heart.innerHTML="💖";
      heart.style.position="fixed";
      heart.style.left=Math.random()*100+"%";
      heart.style.bottom="-20px";
      heart.style.opacity="0.2";
      heart.style.fontSize="18px";
      heart.style.animation=`floatHearts ${6+Math.random()*4}s linear infinite`;
      document.body.appendChild(heart);
    }
  }

  /* ================= 89 SHIMMER ================= */
  if(plan !== "48"){
    const card=document.querySelector(".card");
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
  }

  /* ================= 169 3D TILT ================= */
  if(plan==="169" || plan==="299"){
    const card=document.querySelector(".card");
    if(card){
      document.addEventListener("mousemove",(e)=>{
        const x=(window.innerWidth/2 - e.clientX)/30;
        const y=(window.innerHeight/2 - e.clientY)/30;
        card.style.transform=`rotateY(${x}deg) rotateX(${y}deg)`;
      });
    }
  }

  /* ================= 169 MUSIC FADE ================= */
  if(plan==="169" || plan==="299"){
    const audio=document.createElement("audio");
    audio.src="music/romantic.mp3";
    audio.loop=true;
    audio.volume=0;
    document.body.appendChild(audio);

    document.addEventListener("click",()=>{
      audio.play();
      let fade=setInterval(()=>{
        if(audio.volume<0.3){
          audio.volume+=0.01;
        }else{
          clearInterval(fade);
        }
      },100);
    },{once:true});
  }

  /* ================= 299 LUXURY OVERLAY ================= */
  if(plan==="299"){

    const goldLayer=document.createElement("div");
    goldLayer.style.position="fixed";
    goldLayer.style.top="0";
    goldLayer.style.left="0";
    goldLayer.style.width="100%";
    goldLayer.style.height="100%";
    goldLayer.style.pointerEvents="none";
    goldLayer.style.background=
      "radial-gradient(circle at top, rgba(255,215,0,0.25), transparent 60%)";
    document.body.appendChild(goldLayer);

    const badge=document.createElement("div");
    badge.innerHTML="💍 FOREVER PREMIUM";
    badge.style.position="fixed";
    badge.style.top="20px";
    badge.style.right="20px";
    badge.style.background="gold";
    badge.style.color="black";
    badge.style.padding="10px 20px";
    badge.style.borderRadius="30px";
    badge.style.fontWeight="bold";
    badge.style.boxShadow="0 0 20px gold";
    document.body.appendChild(badge);

    for(let i=0;i<20;i++){
      const spark=document.createElement("div");
      spark.innerHTML="✨";
      spark.style.position="fixed";
      spark.style.left=Math.random()*100+"%";
      spark.style.top="-20px";
      spark.style.animation="fall 5s linear infinite";
      document.body.appendChild(spark);
    }

    /* Extra glow for dark template */
    const bodyBg = getComputedStyle(document.body).background;
    if(bodyBg.includes("#1f1c2c")){
      document.body.style.boxShadow="inset 0 0 120px rgba(255,215,0,0.3)";
    }
  }

  /* ================= 299 TYPING EFFECT ================= */
  if(plan==="299"){
    const heading=document.querySelector("h1");
    if(heading){
      const fullText=heading.innerText;
      heading.innerText="";
      let i=0;
      function type(){
        if(i<fullText.length){
          heading.innerText+=fullText.charAt(i);
          i++;
          setTimeout(type,50);
        }
      }
      type();
    }
  }
}