const CLOUD_NAME = "dsziyn4tp";
const UPLOAD_PRESET = "only4you";

/* ======================================================
   STATE
====================================================== */

let uploadedImages = [];
let uploadedVoice = null;

/* ======================================================
   LOAD PREVIOUS UPLOADS (important for refresh)
====================================================== */

const saved = JSON.parse(localStorage.getItem("only4you_story") || "{}");

if(saved.images){
  uploadedImages = saved.images;
}

if(saved.voices && saved.voices.length){
  uploadedVoice = saved.voices[0];
}

/* ======================================================
   SAVE UPLOADS
====================================================== */

function saveUploads(){

  const story = {
    images: uploadedImages,
    voices: uploadedVoice ? [uploadedVoice] : []
  };

  localStorage.setItem("only4you_story", JSON.stringify(story));

  console.log("Saved uploads:", story);
}

/* ======================================================
   SAFE ELEMENT GETTERS
====================================================== */

const imageInput   = document.getElementById("imageInput");
const voiceInput   = document.getElementById("voiceInput");
const imagePreview = document.getElementById("imagePreview");
const voicePreview = document.getElementById("voicePreview");
const createBtn    = document.getElementById("createBtn");

/* ======================================================
   IMAGE UPLOAD WIDGET
====================================================== */

const imageWidget = cloudinary.createUploadWidget(
{
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  multiple: true,
  maxFiles: 9,
  sources: ["local"],
  resourceType: "image",
  clientAllowedFormats: ["jpg","jpeg","png","webp"],
  maxFileSize: 5000000
},
(error, result) => {

  if (!error && result && result.event === "success") {

    const url = result.info.secure_url;

    uploadedImages.push(url);

    saveUploads();   // ⭐ IMPORTANT

    if (imagePreview) {

      const img = document.createElement("img");
      img.src = url;
      img.style.width = "100px";
      img.style.borderRadius = "10px";
      img.style.margin = "5px";

      imagePreview.appendChild(img);
    }

    checkReady();
  }

  if(error){
    console.error("Image Upload Error:", error);
    alert("Image upload failed.");
  }
});

/* open widget */

if(imageInput){
  imageInput.addEventListener("click", () => imageWidget.open());
}

/* ======================================================
   VOICE UPLOAD WIDGET
====================================================== */

const voiceWidget = cloudinary.createUploadWidget(
{
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  multiple: false,
  sources: ["local"],
  resourceType: "video",
  maxFileSize: 10000000
},
(error, result) => {

  if (!error && result && result.event === "success") {

    uploadedVoice = result.info.secure_url;

    saveUploads();   // ⭐ IMPORTANT

    if (voicePreview){
      voicePreview.innerHTML =
        `<audio controls src="${uploadedVoice}"></audio>`;
    }
  }

  if(error){
    console.error("Voice Upload Error:", error);
    alert("Voice upload failed.");
  }
});

/* open widget */

if(voiceInput){
  voiceInput.addEventListener("click", () => voiceWidget.open());
}

/* ======================================================
   PLAN-AWARE READY CHECK
====================================================== */

function checkReady(){

  if(!createBtn) return;

  const selectedPlan =
    document.querySelector('input[name="plan"]:checked')?.value || "48";

  if(selectedPlan === "299"){
    createBtn.disabled = uploadedImages.length < 3;
  } else {
    createBtn.disabled = false;
  }
}

/* re-check plan change */

document.querySelectorAll('input[name="plan"]').forEach(radio=>{
  radio.addEventListener("change", checkReady);
});

/* ======================================================
   EXPORT HELPERS
====================================================== */

window.getUploadedImages = () => uploadedImages;
window.getUploadedVoice  = () => uploadedVoice;