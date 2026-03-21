require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 2. Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// --------------------------------------------------------
// ENDPOINT: Create Razorpay Order
// --------------------------------------------------------
app.post("/create-order", async (req, res) => {
  try {
    const { plan } = req.body;
    const amountMap = {
      "48": 4800,
      "89": 8900,
      "169": 16900,
      "299": 29900
    };

    const amount = amountMap[plan] || 4800;

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
    });

    res.status(200).json(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// --------------------------------------------------------
// ENDPOINT: Verify Payment & Create Surprise
// --------------------------------------------------------
app.post("/verify-and-create", async (req, res) => {
  try {
    const data = req.body;
    const { 
      sender, receiver, message, template, plan, 
      finalQuestion, images, voices, voice,
      passcodeHash, uid,
      razorpay_payment_id, razorpay_order_id, razorpay_signature
    } = data;

    if (!sender || !receiver || !template) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ADMIN_UID = "Uwtpy28RdRXyOoKbU08485YmjIn2";
    const MASTER_HASH = "0005e3b89a5c213d3501e4b119f4d8ee12b67c1e840c3a168f5cb82dafd27c96";
    
    let isVerified = false;

    // 1. Admin/Passcode check (Free Bypass)
    if (uid === ADMIN_UID || (passcodeHash && passcodeHash === MASTER_HASH)) {
      isVerified = true;
    } 

    // 2. Razorpay Signature Verification (Paid Flow)
    if (!isVerified && razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      return res.status(403).json({ success: false, error: "Payment verification failed" });
    }

    // 3. Server-enforced expiry
    let expiryTime = null;
    if (plan === "48" || plan === "89") {
      expiryTime = Date.now() + 24 * 60 * 60 * 1000;
    } else if (plan === "169") {
      expiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
    } else if (plan === "299") {
      expiryTime = Date.now() + 3650 * 24 * 60 * 60 * 1000;
    }

    // 4. Secure Write to Firestore
    const docRef = await db.collection("surprises").add({
      sender,
      receiver,
      message: message || "",
      template,
      plan: plan || "48",
      finalQuestion: finalQuestion || "",
      images: images || [],
      voices: voices || (voice ? [voice] : []),
      quiz: data.quiz || [], 
      quizAnswers: {}, // Initialize as empty object
      createdAt: Date.now(),
      expiresAt: expiryTime,
      views: 0,
      reactions: 0,
      createdBy: uid || "anonymous",
      razorpay_payment_id: razorpay_payment_id || "admin_bypass"
    });


    res.status(200).json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Surprise creation failed:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Only4You Backend running on http://localhost:${PORT}`);
});

