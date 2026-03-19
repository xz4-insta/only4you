import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ==============================
   FIREBASE
============================== */

const firebaseConfig = {
  apiKey: "AIzaSyBdp7U014kNZzYB4MD9Sqn7MuuCjLWcdxI",
  authDomain: "only4you-55c34.firebaseapp.com",
  projectId: "only4you-55c34"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createBtn = document.getElementById("createBtn");
const statusDiv = document.getElementById("status");

/* ==============================
   PLAN → MAX STAGE
============================== */

function getMaxStage(plan){
  if(plan === "48") return 1;
  if(plan === "89") return 2;
  if(plan === "169") return 4;
  if(plan === "299") return 6;
  return 1;
}

/* ==============================
   CREATE UNIVERSAL
============================== */

createBtn.addEventListener("click", async () => {

  try {

    const sender   = document.getElementById("sender")?.value || "";
    const receiver = document.getElementById("receiver")?.value || "";
    const message  = document.getElementById("message")?.value || "";
    const template = document.getElementById("template")?.value || "valentine";
    const plan     = document.querySelector('input[name="plan"]:checked')?.value || "48";

    if(!sender || !receiver || !message){
      alert("Please fill required fields 💕");
      return;
    }

    const maxStage = getMaxStage(plan);

    createBtn.disabled = true;
    statusDiv.innerText = "Creating your surprise... 💖";

    /* ==============================
       BASE DATA
    ============================== */

    let surpriseData = {
      sender,
      receiver,
      message,
      template,
      plan,
      maxStage,
      createdAt: Date.now(),
      views: 0
    };

    /* ==============================
       EXPIRY BASED ON PLAN
    ============================== */

    if(plan === "48" || plan === "89"){
      surpriseData.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    }

    if(plan === "169"){
      surpriseData.expiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000;
    }

    if(plan === "299"){
      surpriseData.expiresAt = null;
    }

    /* ==============================
       STAGE 2 → IMAGES
    ============================== */

    if(maxStage >= 2){
      const images = window.getUploadedImages ? window.getUploadedImages() : [];
      surpriseData.images = images || [];

      if(plan !== "48" && images.length < 1){
        alert("At least 1 image required 💕");
        createBtn.disabled = false;
        return;
      }
    }

    /* ==============================
       STAGE 3 → VOICE
    ============================== */

    if(maxStage >= 3){
      const voice = window.getUploadedVoice ? window.getUploadedVoice() : null;
      surpriseData.voice = voice || null;
    }

    /* ==============================
       STAGE 4 → FINAL QUESTION
    ============================== */

    if(maxStage >= 4){
      const finalQuestion = document.getElementById("finalQuestion")?.value || "";
      surpriseData.finalQuestion = finalQuestion || "Will you be mine forever? 💖";
    }

    /* ==============================
       STAGE 5 → QUIZ
    ============================== */

    if(maxStage >= 5){

      const quiz = [
        {
          question: document.getElementById("q1")?.value || "",
          options: [
            document.getElementById("q1a")?.value || "",
            document.getElementById("q1b")?.value || "",
            document.getElementById("q1c")?.value || ""
          ]
        },
        {
          question: document.getElementById("q2")?.value || "",
          options: [
            document.getElementById("q2a")?.value || "",
            document.getElementById("q2b")?.value || "",
            document.getElementById("q2c")?.value || ""
          ]
        },
        {
          question: document.getElementById("q3")?.value || "",
          options: [
            document.getElementById("q3a")?.value || "",
            document.getElementById("q3b")?.value || "",
            document.getElementById("q3c")?.value || ""
          ]
        }
      ];

      surpriseData.quiz = quiz.filter(q => q.question.trim() !== "");
    }

    /* ==============================
       SAVE
    ============================== */

    const docRef = await addDoc(collection(db, "surprises"), surpriseData);

    window.location.href = "success.html?id=" + docRef.id + "&owner=true";

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong 😢");
    createBtn.disabled = false;
  }

});