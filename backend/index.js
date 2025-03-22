const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const CLIENT_ID = "3MVG9ecDCcZXF8nQGQN2xUIqeiK49OjxKw.FzjMUk6YBOdISN4ICAP_8iuBx.YCFB3oGU80eT1ibMgmKHhmNX"; // replace this
const CLIENT_SECRET = "ED4F0F6453C4EA12BF382DFF12003D8E67608F42ABDB98C0DE9E76C7C50798EA"; // replace this
const LOGIN_URL = "https://ruby-power-1735.my.salesforce.com/services/oauth2/token";

// Endpoint: Create Refund
app.post("/create-refund", async (req, res) => {
  const { refundName, contactId, amount, reason, location, product } = req.body;

  try {
    // 🔐 Step 1: Get Access Token using Client Credentials
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });

    const authRes = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const authData = await authRes.json();

    if (!authData.access_token) {
      return res.status(401).json({ error: "Token error", details: authData });
    }

    const { access_token, instance_url } = authData;

    // 🧾 Step 2: Create Refund Request
    const payload = {
      Name: refundName,
      Customer_Name__c: contactId,
      Refund_Amount__c: parseFloat(amount),
      Refund_Reason__c: reason,
      Location__c: location,
      Product_Name__c: product
    };

    const createRes = await fetch(`${instance_url}/services/data/v58.0/sobjects/Refund_Request__c`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await createRes.json();

    if (result.id) {
      res.status(200).json({ message: "Success", id: result.id });
    } else {
      res.status(400).json({ error: "Failed to create record", details: result });
    }

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", details: err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Salesforce Proxy running on port ${PORT}`));
