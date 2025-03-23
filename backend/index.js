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

// 🔁 Step 1: Reusable Access Token Function
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

// ✅ Route 1: Create Refund (Manual Form submission)
app.post("/create-refund", async (req, res) => {
  const { refundName, contactId, amount, reason, location, product } = req.body;

  try {
    const { access_token, instance_url } = await getAccessToken();

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
      res.status(200).json({ message: "✅ Refund created", id: result.id });
    } else {
      res.status(400).json({ message: "❌ Refund failed", details: result });
    }

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", details: err });
  }
});

// ✅ Route 2: Get Transactions for a Contact
// ✅ Fetch ALL transactions (no filtering by contact)
app.get("/transactions", async (req, res) => {
  try {
    const { access_token, instance_url } = await getAccessToken();

    const query = encodeURIComponent(`
      SELECT Id, Product_Name__c, Amount__c, Location__c, Transaction_Date__c, Contact__c 
      FROM Transaction__c
    `);

    const txnRes = await fetch(`${instance_url}/services/data/v58.0/query?q=${query}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const data = await txnRes.json();
    res.json(data.records);
  } catch (err) {
    console.error("❌ Error fetching all transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions", details: err });
  }
});


// ✅ Route 3: Request Refund from a Transaction
app.post("/request-refund", async (req, res) => {
  const { transactionId, contactId, reason } = req.body;

  try {
    const { access_token, instance_url } = await getAccessToken();

    // Step 1: Get Transaction Record
    const txnRes = await fetch(`${instance_url}/services/data/v58.0/sobjects/Transaction__c/${transactionId}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const txn = await txnRes.json();

    // Step 2: Create Refund based on Transaction
    const refundPayload = {
      Name: `Refund for ${txn.Name}`,
      Customer_Name__c: contactId,
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

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Salesforce Proxy running on port ${PORT}`));
