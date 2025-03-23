document.getElementById("refundForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // 🎯 Collect form data
  const refundName = document.getElementById("refundRequestName").value.trim();
  const contactId = document.getElementById("customerId").value;
  const amount = parseFloat(document.getElementById("refundAmount").value);
  const reason = document.getElementById("refundReason").value.trim();
  const location = document.getElementById("location").value;
  const product = document.getElementById("productName").value;

  // 🔒 Basic validation
  if (!refundName || !contactId || !amount || !reason || !location || !product) {
    document.getElementById("status").innerText = "⚠️ Please fill out all fields.";
    return;
  }

  const payload = {
    refundName,
    contactId,
    amount,
    reason,
    location,
    product
  };

  // 🌐 Send to backend
  try {
    const res = await fetch("https://salesforce-proxy.onrender.com/create-refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (res.ok && result.id) {
      window.location.href = "thankyou.html";
    } else {
      document.getElementById("status").innerText = "❌ Failed to create refund. Try again.";
      console.warn("Refund failed:", result);
    }

  } catch (err) {
    console.error("Error submitting refund:", err);
    document.getElementById("status").innerText = "❌ Server error while submitting refund.";
  }
});
