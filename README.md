# Shift Scheduler

Employee scheduling app with Twilio SMS notifications.

## File Structure

```
shift-scheduler/
├── public/
│   └── index.html        ← The scheduler app (frontend)
├── index.js              ← Express server + SMS API
├── package.json
├── .env.example          ← Copy to .env with your credentials
└── README.md
```

## Setup in StackBlitz

1. **Import to StackBlitz**
   - Go to [stackblitz.com](https://stackblitz.com)
   - Click **"Import from GitHub"** (if pushing from GitHub)
   - Or drag & drop these files into a new Node.js project

2. **Add Twilio credentials**
   - Click the 🔒 **Secrets** icon in the left sidebar
   - Add these three secrets:
     - `TWILIO_ACCOUNT_SID` → your Twilio Account SID
     - `TWILIO_AUTH_TOKEN` → your Twilio Auth Token
     - `TWILIO_PHONE_NUMBER` → your Twilio number e.g. `+15551234567`

3. **Run it**
   - StackBlitz will auto-run `npm start`
   - Your app opens in the preview panel

4. **Push to GitHub**
   - Click the GitHub icon in StackBlitz sidebar → Connect → Push

5. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
   - Add the same 3 environment variables in Vercel project settings
   - Deploy!

## Getting Twilio Credentials

1. Sign up at [twilio.com](https://twilio.com) (free trial ~$15 credit)
2. From the Console dashboard copy your **Account SID** and **Auth Token**
3. Go to Phone Numbers → Buy a Number → copy it as `+1XXXXXXXXXX`

## Twilio Free Trial Notes

- Free trial lets you send to **verified numbers only**
- Go to Twilio Console → Verified Caller IDs to add test numbers
- Upgrade to paid to send to any number (~$0.0079/text)
