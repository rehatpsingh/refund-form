const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Replace these with your actual Salesforce connected app credentials
const CLIENT_ID = "3MVG9ecDCcZXF8nQGQN2xUIqeiK49OjxKw.FzjMUk6YBOdISN4ICAP_8iuBx.YCFB3oGU80eT1ibMgmKHhmNX";
const CLIENT_SECRET = "ED4F0F6453C4EA12BF382DFF12003D8E67608F42ABDB98C0DE9E76C7C50798EA";
const USERNAME = "rehatpreet2101-cpke@force.com";
const PASSWORD = "20031975@RehcY4iukJiHK9EA7gQHIBbaCu0Z";

const LOGIN_URL = "https://login.salesforce.com/services/oauth2/token";

// API endpoint to create refund request
app.post("/create-refund", async (req, res) => {
  const { refundName, contactId, amount, reason, location, product } = req.body;

  const params = new URLSearchParams({
    grant_type: "password",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username: USERNAME,
    password: PASSWORD
  });

  try {
    // Step 1: Get access token
    const authRes = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const authData = await authRes.json();
    const { access_token, instance_url } = authData;

    if (!access_token || !instance_url) {
      return res.status(401).json({ error: "Failed to get access token", details: authData });
    }

    // Step 2: Create Refund Request
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
app.listen(PORT, () => console.log(`✅ Salesforce Proxy running on port ${PORT}`));
