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

// Moved state loading to the bottom to avoid ReferenceErrors

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
    
    // REPLACE instead of push for 1-photo templates
    const templateSelect = document.getElementById("template");
    const template = templateSelect?.value || "valentine";
    const isOne = ["valentine", "anniversary"].includes(template);
    
    if(isOne) {
      uploadedImages = [url];
    } else {
      uploadedImages.push(url);
    }

    saveUploads();   // ⭐ IMPORTANT
    renderPreviews(); // ⭐ IMPORTANT: Use the unified renderer
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

  const selectedPlan = document.querySelector('input[name="plan"]:checked')?.value || "48";
  const template = document.getElementById("template")?.value || "valentine";
  const isOnePhotoTemplate = ["valentine", "anniversary"].includes(template);

  if(isOnePhotoTemplate) {
    // 1 image exactly
    createBtn.disabled = uploadedImages.length !== 1;
  } else if(selectedPlan === "299" || template === "epic") {
    // 3-9 images
    createBtn.disabled = uploadedImages.length < 3;
  } else {
    // Basic plans (can be 1 image for simple stories)
    createBtn.disabled = uploadedImages.length < 1;
  }
}

/* re-check plan change or template change */
const templateSelect = document.getElementById("template");
if(templateSelect){
  templateSelect.addEventListener("change", () => {
    checkReady();
    
    // Update Cloudinary Widget Limit on the fly!
    const template = templateSelect.value;
    const isOnePhotoTemplate = ["valentine", "anniversary"].includes(template);
    
    if(isOnePhotoTemplate) {
      imageWidget.update({ maxFiles: 1, multiple: false });
      if(imageInput) imageInput.innerText = "Upload Puzzle Image (1 Only) 💕";
      
      // If they already uploaded more, alert and trim
      if(uploadedImages.length > 1) {
        alert("This template only supports 1 puzzle image. Trimming your selection! ❤️");
        uploadedImages = uploadedImages.slice(0, 1);
        saveUploads();
        renderPreviews();
      }
    } else {
      imageWidget.update({ maxFiles: 9, multiple: true });
      if(imageInput) imageInput.innerText = "Upload Memories (3-9) 💕";
    }
  });
}

document.querySelectorAll('input[name="plan"]').forEach(radio=>{
  radio.addEventListener("change", checkReady);
});

function renderPreviews() {
  if(!imagePreview) return;
  imagePreview.innerHTML = "";
  uploadedImages.forEach((url, i) => {
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.margin = "5px";

    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100px";
    img.style.borderRadius = "10px";
    
    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "×";
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "-5px";
    removeBtn.style.right = "-5px";
    removeBtn.style.background = "#ff4d6d";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "50%";
    removeBtn.style.width = "22px";
    removeBtn.style.height = "22px";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.display = "flex";
    removeBtn.style.alignItems = "center";
    removeBtn.style.justifyContent = "center";
    removeBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    
    removeBtn.onclick = (e) => {
       e.preventDefault();
       uploadedImages.splice(i, 1);
       saveUploads();
       renderPreviews();
       checkReady();
    };

    container.appendChild(img);
    container.appendChild(removeBtn);
    imagePreview.appendChild(container);
  });
}

/* ======================================================
   INITIALIZATION (Final Step)
====================================================== */

function updateWidgetForTemplate(){
  const templateSelect = document.getElementById("template");
  const template = templateSelect?.value || "valentine";
  const isOne = ["valentine", "anniversary"].includes(template);
  if(imageWidget) {
    imageWidget.update({ maxFiles: isOne ? 1 : 9, multiple: !isOne });
  }
  if(imageInput) {
    imageInput.innerText = isOne ? "Upload Puzzle Image (1 Only) 💕" : "Upload Memories (3-9) 💕";
  }
}

if(saved.images){
  uploadedImages = saved.images;
  renderPreviews();
}

if(saved.voices && saved.voices.length){
  uploadedVoice = saved.voices[0];
}

// Initial check
if(templateSelect) updateWidgetForTemplate();

/* ======================================================
   EXPORT HELPERS
====================================================== */

window.getUploadedImages = () => uploadedImages;
window.getUploadedVoice  = () => uploadedVoice;