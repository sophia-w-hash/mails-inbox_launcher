<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Fast Mail Launcher</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #eef2f7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      padding: 30px 16px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 40px 36px;
      width: 100%;
      max-width: 900px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .title {
      text-align: center;
      font-size: 26px;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 28px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    input, textarea {
      width: 100%;
      padding: 15px 18px;
      border: 1.5px solid #dde3ed;
      border-radius: 10px;
      font-size: 15px;
      font-family: inherit;
      color: #1a1a2e;
      background: #fff;
      outline: none;
      transition: border 0.2s;
    }
    input:focus, textarea:focus { border-color: #4f7dff; }
    input::placeholder, textarea::placeholder { color: #b0bec5; }
    textarea { min-height: 148px; resize: vertical; line-height: 1.6; }
    .pass-wrap { position: relative; }
    .eye-btn {
      position: absolute; right: 13px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      cursor: pointer; font-size: 16px; color: #4f7dff;
    }
    .btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 4px;
    }
    .btn {
      padding: 16px;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      background: #4f7dff;
      color: #fff;
      transition: background 0.2s;
    }
    .btn:hover { background: #3a6aee; }
    .btn:disabled { background: #a0aec0; cursor: not-allowed; }

    /* Status */
    .status {
      margin-top: 18px;
      padding: 13px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      display: none;
    }
    .status.show { display: block; }
    .status.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .status.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .status.loading { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

    /* Log table */
    .log-wrap { margin-top: 24px; display: none; }
    .log-wrap.show { display: block; }
    .log-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #f1f5f9; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { font-weight: 700; color: #64748b; font-size: 11px; letter-spacing: 0.8px; }
    .badge { border-radius: 6px; padding: 2px 10px; font-size: 11px; font-weight: 700; color: #fff; }
    .badge.sent    { background: #16a34a; }
    .badge.failed  { background: #dc2626; }
    .badge.sending { background: #2563eb; }

    /* CSV */
    .csv-row { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .btn-csv {
      background: #f1f5f9; border: 1.5px solid #dde3ed;
      color: #64748b; border-radius: 8px;
      padding: 6px 14px; font-size: 12px; cursor: pointer; font-weight: 600;
    }
    .csv-name { font-size: 12px; color: #64748b; }

    @media (max-width: 600px) {
      .row, .btns { grid-template-columns: 1fr; }
      .card { padding: 24px 14px; }
    }
  </style>
</head>
<body>
<div class="card">

  <div class="title">📧 Fast Mail Launcher</div>

  <!-- Row 1 -->
  <div class="row">
    <input type="text"  id="senderName"   placeholder="Sender Name" />
    <input type="email" id="gmailAddress" placeholder="Your Gmail" />
  </div>

  <!-- Row 2 -->
  <div class="row">
    <div class="pass-wrap">
      <input type="password" id="appPassword" placeholder="App Password" />
      <button class="eye-btn" onclick="togglePass()">👁</button>
    </div>
    <input type="text" id="subject" placeholder="Subject" />
  </div>

  <!-- Row 3 -->
  <div class="row">
    <textarea id="body"       placeholder="Message Body"></textarea>
    <div>
      <textarea id="recipients" placeholder="Recipients (comma or newline)"></textarea>
      <div class="csv-row">
        <input type="file" id="csvFile" accept=".csv" style="display:none" onchange="handleCSV(event)" />
        <button class="btn-csv" onclick="document.getElementById('csvFile').click()">📂 Upload CSV</button>
        <span class="csv-name" id="csvName"></span>
      </div>
    </div>
  </div>

  <!-- Buttons -->
  <div class="btns">
    <button class="btn" id="sendBtn" onclick="sendEmails()">Send All</button>
    <button class="btn" onclick="clearAll()">Logout</button>
  </div>

  <!-- Status message -->
  <div class="status" id="status"></div>

  <!-- Log table -->
  <div class="log-wrap" id="logWrap">
    <div class="log-title">SEND LOG</div>
    <table>
      <thead>
        <tr><th>#</th><th>RECIPIENT</th><th>TIME</th><th>STATUS</th></tr>
      </thead>
      <tbody id="logBody"></tbody>
    </table>
  </div>

</div>

<script>
  function togglePass() {
    const i = document.getElementById('appPassword');
    i.type = i.type === 'password' ? 'text' : 'password';
  }

  function parseRecipients(text) {
    return text.split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes('@'));
  }

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('csvName').textContent = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').slice(1);
      const emails = lines.map(l => l.split(',')[0]?.trim()).filter(e => e && e.includes('@'));
      document.getElementById('recipients').value = emails.join('\n');
      showStatus(`✅ CSV loaded: ${emails.length} recipients`, 'success');
    };
    reader.readAsText(file);
  }

  function clearAll() {
    ['senderName','gmailAddress','appPassword','subject','body','recipients'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('csvName').textContent = '';
    document.getElementById('status').className = 'status';
    document.getElementById('logWrap').className = 'log-wrap';
    document.getElementById('logBody').innerHTML = '';
  }

  function showStatus(msg, type) {
    const s = document.getElementById('status');
    s.textContent = msg;
    s.className = `status ${type} show`;
  }

  async function sendEmails() {
    const gmailAddress = document.getElementById('gmailAddress').value.trim();
    const appPassword  = document.getElementById('appPassword').value.trim();
    const senderName   = document.getElementById('senderName').value.trim();
    const subject      = document.getElementById('subject').value.trim();
    const body         = document.getElementById('body').value.trim();
    const recipients   = parseRecipients(document.getElementById('recipients').value);

    if (!gmailAddress || !appPassword) return showStatus('❌ Gmail aur App Password required!', 'error');
    if (!recipients.length)            return showStatus('❌ Kam se kam ek recipient add karo!', 'error');
    if (!subject || !body)             return showStatus('❌ Subject aur Body required!', 'error');

    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Sending...';
    showStatus(`📤 ${recipients.length} emails bheje ja rahe hain...`, 'loading');

    // Show log with pending rows
    const logBody = document.getElementById('logBody');
    document.getElementById('logWrap').className = 'log-wrap show';
    logBody.innerHTML = recipients.map((email, i) => `
      <tr id="row-${i}">
        <td>${i+1}</td>
        <td>${email}</td>
        <td>${new Date().toLocaleTimeString()}</td>
        <td><span class="badge sending">⏳ Sending</span></td>
      </tr>`).join('');

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmailAddress, appPassword, recipients, subject, body, senderName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      data.results.forEach((result, i) => {
        const badge = document.querySelector(`#row-${i} .badge`);
        if (badge) {
          badge.className = `badge ${result.status}`;
          badge.textContent = result.status === 'sent' ? '✓ Sent' : '✗ Failed';
        }
      });

      showStatus(`✅ ${data.sentCount}/${recipients.length} emails sent!`, 'success');
    } catch (err) {
      recipients.forEach((_, i) => {
        const badge = document.querySelector(`#row-${i} .badge`);
        if (badge) { badge.className = 'badge failed'; badge.textContent = '✗ Failed'; }
      });
      showStatus(`❌ Error: ${err.message}`, 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Send All';
  }
</script>
</body>
</html>
