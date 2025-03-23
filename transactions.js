async function loadTransactions() {
  document.getElementById("status").innerText = "🔄 Loading all transactions...";

  const BACKEND_URL = "https://salesforce-proxy.onrender.com";

  try {
    const res = await fetch(`${BACKEND_URL}/transactions`);
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
        <tr>
          <td>${txn.Product_Name__c || '-'}</td>
          <td>$${txn.Amount__c || '0.00'}</td>
          <td>${txn.Transaction_Date__c || '-'}</td>
          <td>${txn.Location__c || '-'}</td>
          <td>
            <button onclick='requestRefund("${txn.Id}", "${txn.Contact__c}")'>Request Refund</button>
          </td>
        </tr>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("status").innerText = "✅ All transactions loaded.";
  } catch (err) {
    console.error("❌ Error loading transactions:", err);
    document.getElementById("status").innerText = "❌ Failed to load transactions.";
  }
}
