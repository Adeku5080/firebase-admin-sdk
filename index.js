const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Endpoint to check if phone number exists
app.post("/checkPhoneNumber", async (req, res) => {
  let { phoneNumber } = req.body;
  phoneNumber = phoneNumber.replace(/\s+/g, "");

  try {
    const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
    if (userRecord.phoneNumber) {
      return res.status(403).json({
        message: "Phone number already exists",
        exists: true,
      });
    }
    return res
      .status(200)
      .json({ message: "Phone number does not exist", exists: false });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return res
        .status(200)
        .json({ message: "Phone number does not exist", exists: false });
    } else {
      return res.status(500).send({ message: "Internal server error" });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
