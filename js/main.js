/* =========================================
ONLY4YOU MAIN JS - 3D CAROUSEL & TEMPLATES
========================================= */

const templates = [
  { id: "valentine", title: "Valentine 🌹", desc: "Red Velvet & Black aesthetic with romantic blooms." },
  { id: "forgiveness", title: "Forgiveness 💛", desc: "Soft yellow and pink tones to melt their heart." },
  { id: "carebox", title: "Comfort Kit 🧸🍫", desc: "Digital Emergency Care Package for period pampering & cozy hugs.", isPremium: true },
  { id: "epic", title: "Epic Love Story 💍", desc: "The ultimate premium multi-stage cinematic journey." },
  { id: "anniversary", title: "Anniversary 🥂", desc: "Timeless Gold & Cream class for your special day." },
  { id: "birthday", title: "Birthday 🎂", desc: "Playful pastel rainbow to celebrate their big day!" },
  { id: "missyou", title: "Miss You ☁️", desc: "Exclusive Premium: Sky Blue & White dreamy theme.", isPremium: true }
];

let currIndex = 0;
let items = [];
let carousel = null;
let autoPlayInterval = null;
const radius = 220; // Z translation distance

export function initCarousel() {
  carousel = document.getElementById("templateCarousel");
  items = document.querySelectorAll(".carousel-item");
  if (!items.length || !carousel) return;

  const angle = 360 / items.length;

  items.forEach((item, i) => {
    item.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`;
  });

  updateCarousel();
  startAutoPlay();

  const container = document.querySelector(".carousel-container");
  if (container) {
    container.addEventListener("mouseenter", stopAutoPlay);
    container.addEventListener("mouseleave", startAutoPlay);
    container.addEventListener("touchstart", stopAutoPlay, { passive: true });
  }
}

function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(() => { rotateTo(currIndex + 1); }, 4000);
}

function stopAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
}

export function updateCarousel() {
  if (!carousel || !items.length) return;

  const angle = 360 / items.length;
  carousel.style.transform = `translateZ(-${radius}px) rotateY(${-currIndex * angle}deg)`;

  let normalizedIndex = ((currIndex % templates.length) + templates.length) % templates.length;
  const activeData = templates[normalizedIndex];

  const nameEl = document.getElementById("activeTitle");
  const descEl = document.getElementById("activeDesc");

  if (nameEl && activeData) {
    nameEl.innerHTML = activeData.title + (activeData.isPremium ? ' <span style="font-size:12px; background:#0288d1; color:white; padding:3px 8px; border-radius:10px; vertical-align:middle;">PREMIUM</span>' : '');
  }
  if (descEl && activeData) {
    descEl.innerText = activeData.desc;
  }

  items.forEach((item, i) => {
    const iframe = item.querySelector("iframe");
    const placeholder = item.querySelector(".iframe-placeholder");

    let rawDiff = Math.abs(i - normalizedIndex);
    let diff = Math.min(rawDiff, templates.length - rawDiff);

    if (i === normalizedIndex) {
      item.style.opacity = "1";
      item.style.zIndex = "100";
      item.style.pointerEvents = "auto";
      item.style.boxShadow = "0 0 50px rgba(231,84,128,0.5)";
      item.style.border = "4px solid #E75480";
      
      // Load active iframe
      if (iframe) {
        const srcToLoad = iframe.getAttribute("data-src") || iframe.getAttribute("src");
        if (srcToLoad && (!iframe.src || iframe.src === "about:blank" || iframe.src.endsWith("about:blank"))) {
          iframe.onload = () => {
            iframe.style.display = "block";
            if (placeholder) placeholder.style.display = "none";
          };
          iframe.src = srcToLoad;
          iframe.style.display = "block";
          if (placeholder) placeholder.style.display = "none";
        } else {
          iframe.style.display = "block";
          if (placeholder) placeholder.style.display = "none";
        }
      }
    } else {
      item.style.opacity = diff === 1 ? "0.4" : "0.15";
      item.style.zIndex = String(10 - diff);
      item.style.pointerEvents = "none";
      item.style.boxShadow = "none";
      item.style.border = "4px solid #fff";
      
      // Unload inactive iframe to save memory
      if (iframe && iframe.src && !iframe.src.endsWith("about:blank")) {
        const currentSrc = iframe.getAttribute("src");
        if (currentSrc && currentSrc !== "about:blank") {
          iframe.setAttribute("data-src", currentSrc);
        }
        iframe.src = "about:blank";
        iframe.style.display = "none";
        if (placeholder) placeholder.style.display = "flex";
      }
    }
  });
}

export function rotateTo(n) {
  currIndex = n;
  updateCarousel();
}

export function prevTemplate() {
  rotateTo(currIndex - 1);
}

export function nextTemplate() {
  rotateTo(currIndex + 1);
}

export function goToCreateTemplate() {
  let normalizedIndex = ((currIndex % templates.length) + templates.length) % templates.length;
  const activeData = templates[normalizedIndex];
  if (!activeData) return;
  window.location.href = `create.html?template=${activeData.id}${activeData.isPremium ? "&plan=169" : ""}`;
}
