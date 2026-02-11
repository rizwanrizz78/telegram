# Pulse Miner - Telegram Mini App

A retro pixel-art style crypto mining simulation game for Telegram. Users can start a mining session, come back later to claim rewards ($PULSE tokens), refer friends, and climb the leaderboard.

## Features
- **Passive Mining**: Users mine $PULSE over a 4-hour period.
- **Referral System**: Earn bonuses for inviting friends.
- **Leaderboard**: Compete for the top spot.
- **Pixel Art UI**: Retro cyberpunk aesthetic.
- **Persistent Data**: Uses SQLite for data storage (easy to setup).

## Tech Stack
- **Frontend**: React, Vite, Tailwind-like custom CSS.
- **Backend**: Node.js, Express.
- **Database**: SQLite (local file database).

## Prerequisites
- Node.js (v16+)
- A Telegram account

## Quick Start (Local Development)

1.  **Clone the repository** (if you haven't already).

2.  **Install Dependencies**
    ```bash
    cd pulse-miner/backend
    npm install
    cd ../frontend
    npm install
    ```

3.  **Run the App**
    From the `pulse-miner` root directory:
    ```bash
    chmod +x start.sh
    ./start.sh
    ```
    This will start:
    - Backend on `http://localhost:3000`
    - Frontend on `http://localhost:5173`

4.  **Test in Browser**
    Open `http://localhost:5173`.
    *Note: Since you are not in Telegram, the app will use a "Mock User" for testing purposes.*

## Telegram Bot Setup (For Real Use)

To run this inside Telegram, you need to expose your local server to the internet (using ngrok) or deploy it to a server.

### 1. Create a Bot
1.  Open Telegram and search for **@BotFather**.
2.  Send `/newbot` and follow the instructions to create a bot.
3.  Copy the **API Token** (you'll need it later for advanced features like verifying initData, though this MVP skips strict validation for simplicity).

### 2. Expose Local Server (Using ngrok)
1.  Install [ngrok](https://ngrok.com/).
2.  Run `ngrok http 5173` (to expose the frontend).
3.  Copy the HTTPS URL (e.g., `https://abcd-1234.ngrok-free.app`).

*Note: You also need to expose the backend if you are not proxying through Vite in production. For local dev with ngrok, just exposing frontend works if Vite proxies correctly, but for Telegram Mini Apps, it's often easier to deploy both.*

### 3. Configure Mini App
1.  In **@BotFather**, send `/newapp`.
2.  Select your bot.
3.  Enter a title and description.
4.  When asked for the **Web App URL**, paste your ngrok URL (or deployed URL).
5.  BotFather will give you a link (e.g., `t.me/YourBotName/appname`).

### 4. Update Frontend Config
In `pulse-miner/frontend/src/pages/Friends.jsx`, update the referral link to match your bot:
```javascript
const link = `https://t.me/YourBotName?start=${user.telegram_id}`;
```

## Deployment

### Database
This project uses **SQLite** (`pulse.db` file in `backend/`).
- **Pros**: Zero configuration, easy to backup.
- **Cons**: If you deploy to serverless platforms (like Vercel/Netlify), the file will be reset on every deployment.
- **Recommendation**: For production, use a VPS (DigitalOcean, Hetzner) or a service with persistent storage (Render Disk, Railway Volume). Alternatively, switch `db.js` to use **Supabase** (PostgreSQL) or **Firebase**.

### Deploying to a VPS
1.  Copy the `pulse-miner` folder to your server.
2.  Run `npm install` in both folders.
3.  Use `pm2` to run the backend and frontend (or build the frontend and serve it statically via Nginx/Express).

## License
MIT
