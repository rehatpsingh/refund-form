const BACKEND_URL = "https://salesforce-proxy.onrender.com";

async function loadTransactions() {
  const contactId = document.getElementById("contactId").value;

  if (!contactId) {
    alert("Please select a contact first.");
    return;
  }

  document.getElementById("status").innerText = "🔄 Loading transactions...";

  try {
    const res = await fetch(`${BACKEND_URL}/transactions?contactId=${contactId}`);
    const data = await res.json();

    const tbody = document.querySelector("#txnTable tbody");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No transactions found.</td></tr>`;
      document.getElementById("status").innerText = "No transactions found.";
      return;
    }

    data.forEach(txn => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${txn.Product_Name__c || '-'}</td>
        <td>$${txn.Amount__c || '0.00'}</td>
        <td>${txn.Transaction_Date__c || '-'}</td>
        <td>${txn.Location__c || '-'}</td>
        <td>
          <button onclick='requestRefund("${txn.Id}", "${contactId}")'>Request Refund</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("status").innerText = "✅ Transactions loaded.";
  } catch (err) {
    console.error("❌ Error loading transactions:", err);
    document.getElementById("status").innerText = "❌ Failed to load transactions.";
  }
}

async function requestRefund(transactionId, contactId) {
  const reason = prompt("Enter refund reason:");
  if (!reason) return;

  document.getElementById("status").innerText = "🔁 Submitting refund...";

  try {
    const res = await fetch(`${BACKEND_URL}/request-refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, contactId, reason })
    });

    const result = await res.json();
    document.getElementById("status").innerText =
      result.message || "✅ Refund submitted!";
    console.log("Refund Result:", result);
  } catch (err) {
    console.error("❌ Refund error:", err);
    document.getElementById("status").innerText =
      "❌ Failed to submit refund.";
  }
}
