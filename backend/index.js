const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 🔐 Salesforce credentials
const CLIENT_ID = "3MVG9ecDCcZXF8nQGQN2xUIqeiK49OjxKw.FzjMUk6YBOdISN4ICAP_8iuBx.YCFB3oGU80eT1ibMgmKHhmNX";
const CLIENT_SECRET = "ED4F0F6453C4EA12BF382DFF12003D8E67608F42ABDB98C0DE9E76C7C50798EA";
const LOGIN_URL = "https://ruby-power-1735.my.salesforce.com/services/oauth2/token";

// ♻️ Step 1: Reusable Access Token
async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  return await res.json();
}

// ✅ Route: Request Refund using only Transaction ID and Reason
app.post("/request-refund", async (req, res) => {
  const { transactionId, reason } = req.body;

  if (!transactionId || !reason) {
    return res.status(400).json({ message: "⚠️ Missing transactionId or reason." });
  }

  try {
    const { access_token, instance_url } = await getAccessToken();

    // 🔍 Step 1: Get Transaction Details
    const txnRes = await fetch(`${instance_url}/services/data/v58.0/sobjects/Transaction__c/${transactionId}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const txn = await txnRes.json();

    if (!txn || txn.errorCode) {
      return res.status(404).json({ message: "❌ Transaction not found", details: txn });
    }

    // 🧾 Step 2: Create Refund Request
    const refundPayload = {
      Name: `Refund for ${txn.Name}`,
      Customer_Name__c: txn.Contact__c,
      Refund_Amount__c: txn.Amount__c,
      Refund_Reason__c: reason,
      Location__c: txn.Location__c,
      Product_Name__c: txn.Product_Name__c,
      Transaction__c: transactionId
    };

    const refundRes = await fetch(`${instance_url}/services/data/v58.0/sobjects/Refund_Request__c`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(refundPayload)
    });

    const result = await refundRes.json();

    if (result.id) {
      res.status(200).json({ message: "✅ Refund created", id: result.id });
    } else {
      res.status(400).json({ message: "❌ Refund failed", details: result });
    }

  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: "Server error", details: err });
  }
});

// (Optional) Route: Fetch all transactions (for future UI use)
app.get("/transactions", async (req, res) => {
  try {
    const { access_token, instance_url } = await getAccessToken();

    const query = encodeURIComponent(`
      SELECT Id, Name, Product_Name__c, Amount__c, Location__c, Transaction_Date__c, Contact__c 
      FROM Transaction__c
    `);

    const txnRes = await fetch(`${instance_url}/services/data/v58.0/query?q=${query}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const data = await txnRes.json();
    res.json(data.records);
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions", details: err });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Salesforce Proxy running on port ${PORT}`));
