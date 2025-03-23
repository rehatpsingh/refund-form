document.getElementById("refundForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const transactionId = document.getElementById("transactionId").value.trim();
  const reason = document.getElementById("refundReason").value.trim();

  if (!transactionId || !reason) {
    document.getElementById("status").innerText = "⚠️ Please fill out both fields.";
    return;
  }

  const payload = { transactionId, reason };

  try {
    const res = await fetch("https://salesforce-proxy.onrender.com/request-refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (res.ok && result.id) {
      window.location.href = "thankyou.html";
    } else {
      document.getElementById("status").innerText = "❌ Refund failed.";
      console.warn("Refund error:", result);
    }
  } catch (err) {
    console.error("❌ Error:", err);
    document.getElementById("status").innerText = "❌ Server error. Try again.";
  }
});
