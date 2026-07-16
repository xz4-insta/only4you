const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({origin: true});

admin.initializeApp();
const db = admin.firestore();

// ⚠️ PUT YOUR TEST KEYS HERE (ONLY LOCALLY)
const razorpay = new Razorpay({
  key_id: "rzp_live_SWd5OBd7ekZ0DB",
  key_secret: "8Atw0zOfJTU1dW9K70gGwZ47",
});

exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {plan} = req.body;
      const amountMap = {
        "48": 4800,
        "89": 8900,
        "169": 16900,
        "299": 29900,
        "1500": 150000,
      };

      const amount = amountMap[plan] || 4800;

      const order = await razorpay.orders.create({
        amount: amount,
        currency: "INR",
      });

      res.status(200).json(order);
    } catch (error) {
      console.error("Order creation failed:", error);
      res.status(500).send("Order creation failed");
    }
  });
});
exports.createSurprise = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

      const data = req.body;
      const {
        sender, receiver, message, template, plan,
        finalQuestion, images, voices,
        passcodeHash, uid,
        razorpay_payment_id, razorpay_order_id, razorpay_signature,
      } = data;

      // 1. Basic Validation
      if (!sender || !receiver || !template) {
        return res.status(400).send("Missing required fields");
      }

      const ADMIN_UID = "Uwtpy28RdRXyOoKbU08485YmjIn2";
      const MASTER_HASH = "985ce7a08b6ce39600e12dcf6f17e3f605a9c9f4d34c1b9201f19630327f12e8";

      let isVerified = false;

      // 2. Admin/Passcode check (Free Bypass)
      if (uid === ADMIN_UID || passcodeHash === MASTER_HASH) {
        isVerified = true;
      }

      // 3. Razorpay Signature Verification (Paid Flow)
      if (!isVerified && razorpay_payment_id && razorpay_order_id && razorpay_signature) {
        const crypto = require("crypto");
        const hmac = crypto.createHmac("sha256", "8Atw0zOfJTU1dW9K70gGwZ47");
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature === razorpay_signature) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        return res.status(403).json({success: false, error: "Payment verification failed"});
      }

      // 4. Server-enforced expiry
      let expiryTime = null;
      if (plan === "48" || plan === "89") {
        expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      } else if (plan === "169") {
        expiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
      } else if (plan === "299" || plan === "1500") {
        expiryTime = Date.now() + 3650 * 24 * 60 * 60 * 1000; // Forever (10 years)
      }

      // 5. Secure Write
      const docRef = await db.collection("surprises").add({
        sender,
        receiver,
        message: message || "",
        template,
        plan: plan || "48",
        finalQuestion: finalQuestion || "",
        images: images || [],
        voices: voices || [],
        createdAt: Date.now(),
        expiresAt: expiryTime,
        views: 0,
        reactions: 0,
        createdBy: uid || "anonymous",
        razorpay_payment_id: razorpay_payment_id || "admin_bypass",
      });

      res.status(200).json({success: true, id: docRef.id});
    } catch (error) {
      console.error("Surprise creation failed:", error);
      res.status(500).json({success: false, error: "Internal Server Error"});
    }
  });
});
