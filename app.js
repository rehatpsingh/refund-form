document.getElementById("refundForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const refundName = document.getElementById("refundRequestName").value;
  const contactId = document.getElementById("customerId").value;
  const amount = document.getElementById("refundAmount").value;
  const reason = document.getElementById("refundReason").value;
  const location = document.getElementById("location").value;
  const product = document.getElementById("productName").value;

  const payload = {
    refundName,
    contactId,
    amount,
    reason,
    location,
    product
  };

  try {
    const res = await fetch("https://salesforce-proxy.onrender.com/create-refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.id) {
      window.location.href = "thankyou.html";
    } else {
      document.getElementById("status").innerText = "❌ Failed to create refund.";
      console.log(result);
    }
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "❌ Error submitting form.";
  }
});
