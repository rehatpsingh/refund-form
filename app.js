const CLIENT_ID = "3MVG9ecDCcZXF8nQGQN2xUIqeiK49OjxKw.FzjMUk6YBOdISN4ICAP_8iuBx.YCFB3oGU80eT1ibMgmKHhmNX";
const CLIENT_SECRET = "ED4F0F6453C4EA12BF382DFF12003D8E67608F42ABDB98C0DE9E76C7C50798EA";
const USERNAME = "rehatpreet2101-cpke@force.com";
const PASSWORD = "20031975@RehcY4iukJiHK9EA7gQHIBbaCu0Z";

const LOGIN_URL = "https://login.salesforce.com/services/oauth2/token";

document.getElementById("refundForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // 📌 Capture form values
  const refundName = document.getElementById("refundRequestName").value;
  const contactId = document.getElementById("customerId").value;
  const amount = document.getElementById("refundAmount").value;
  const reason = document.getElementById("refundReason").value;
  const location = document.getElementById("location").value;
  const product = document.getElementById("productName").value;

  const tokenData = await getAccessToken();
  if (!tokenData || !tokenData.access_token) {
    document.getElementById("status").innerText = "❌ Login failed";
    return;
  }

  const { access_token, instance_url } = tokenData;

  const success = await createRefund(
    access_token,
    instance_url,
    refundName,
    contactId,
    amount,
    reason,
    location,
    product
  );

  if (success) {
    window.location.href = "thankyou.html";
  } else {
    document.getElementById("status").innerText = "❌ Failed to create refund.";
  }
});

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: "password",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username: USERNAME,
    password: PASSWORD
  });

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    return await res.json();
  } catch (err) {
    console.error("Token error:", err);
    return null;
  }
}

async function createRefund(token, instanceUrl, refundName, contactId, amount, reason, location, product) {
  const payload = {
    Name: refundName,
    Customer_Name__c: contactId,
    Refund_Amount__c: parseFloat(amount),
    Refund_Reason__c: reason,
    Location__c: location,
    Product_Name__c: product
  };

  try {
    const res = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Refund_Request__c`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log("Response from Salesforce:", result);
    return !!result.id;
  } catch (err) {
    console.error("Create refund error:", err);
    return false;
  }
}
