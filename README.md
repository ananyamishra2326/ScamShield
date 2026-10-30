# 🛡️ Scam Shield

**Scam Shield** is a web app that helps users recognize online scams, analyze suspicious messages, and report cyber incidents — built as a mini project for digital safety awareness.

🔗 **Live Demo:** *(deploy to Vercel and add your URL here)*

---

## ✨ Features

- **🔍 Scam Message Analyzer** — Paste any suspicious SMS, call description, or link; get instant rule-based risk analysis
- **📋 Scam Alert Center** — Learn about common fraud patterns (Banking fraud, UPI scams, phishing, fake calls)
- **📝 Incident Report Form** — Submit incident reports that are saved to a real database
- **🚨 Emergency Help** — Direct links to India's Cybercrime Portal (cybercrime.gov.in) and helpline 1930

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3, Flask, Flask-CORS |
| Database | SQLite (local dev) / PostgreSQL via Neon (production) |
| Deployment | Vercel (serverless) |

---

## 📁 Project Structure

```
scamshield/
├── api/
│   └── index.py          # Flask serverless API (Vercel)
├── backend/
│   └── app.py            # Local Flask dev server
├── index.html            # Main frontend page
├── style.css             # Styling
├── script.js             # Frontend logic & API calls
├── database.py           # SQLite helper (local dev)
├── schema.sql            # Database schema
├── requirements.txt      # Python dependencies
├── vercel.json           # Vercel routing config
├── .gitignore
└── .vercelignore
```

---

## 🚀 Run Locally

### Prerequisites
- Python 3.10+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ananyamishra2326/scamshield.git
cd scamshield

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the backend
python api/index.py

# 4. Open index.html in your browser
```

The backend runs at `http://127.0.0.1:5000`. The frontend auto-detects it.

---

## ☁️ Deploy to Vercel

1. Fork or clone this repo to your GitHub account
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo
3. Click **Deploy** — Vercel auto-detects `vercel.json`

### Optional: Persistent Database (Neon PostgreSQL)

By default, Vercel uses SQLite in `/tmp` (resets on cold starts). For persistent storage:

1. Create a free DB at [neon.tech](https://neon.tech)
2. Copy your connection string
3. In Vercel → **Settings → Environment Variables**, add:
   ```
   DATABASE_URL = postgresql://...your-neon-connection-string...
   ```
4. Redeploy

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server & DB status check |
| `POST` | `/api/report` | Save a new incident report |
| `GET` | `/api/reports` | List all saved reports |

### Example: Submit a report

```bash
curl -X POST http://127.0.0.1:5000/api/report \
  -H "Content-Type: application/json" \
  -d '{"incident_type":"UPI Fraud","incident_date":"2026-10-30","description":"Received a fake collect request"}'
```

---

## 📞 Emergency Resources (India)

- **Cybercrime Helpline:** [1930](tel:1930)
- **Official Portal:** [cybercrime.gov.in](https://cybercrime.gov.in/)
- **Ministry of Home Affairs:** [mha.gov.in](https://www.mha.gov.in/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> ⚠️ Scam checks are rule-based guidance, not a guarantee that a message is safe. Always verify through official channels.
