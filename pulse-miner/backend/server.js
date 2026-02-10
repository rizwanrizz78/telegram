const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper to get user by telegram_id
const getUser = (telegramId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Auth / Login
app.post('/api/auth', async (req, res) => {
    const { id, first_name, last_name, username, start_param } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing user ID' });

    try {
        let user = await getUser(id);

        if (!user) {
            // Create new user
            let referrerId = null;
            if (start_param && start_param !== String(id)) {
                // Check if referrer exists
                const referrer = await getUser(start_param);
                if (referrer) {
                    referrerId = start_param;
                }
            }

            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (telegram_id, first_name, last_name, username, referrer_id) VALUES (?, ?, ?, ?, ?)',
                    [id, first_name, last_name, username, referrerId],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });
            user = await getUser(id);
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Data
app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await getUser(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start Mining
app.post('/api/mine/start', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await getUser(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.mining_started_at) {
            return res.status(400).json({ error: 'Already mining' });
        }

        const now = Date.now();
        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET mining_started_at = ? WHERE telegram_id = ?', [now, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ success: true, mining_started_at: now });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Claim Rewards
app.post('/api/mine/claim', async (req, res) => {
    const { id } = req.body;
    const MINING_DURATION = 4 * 60 * 60 * 1000; // 4 hours
    const REWARD = 25;
    const REFERRAL_BONUS = 5; // 20% of reward

    try {
        const user = await getUser(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.mining_started_at) {
            return res.status(400).json({ error: 'Not currently mining' });
        }

        const now = Date.now();
        const elapsed = now - user.mining_started_at;

        if (elapsed < MINING_DURATION) {
            return res.status(400).json({ error: 'Mining not finished yet', time_left: MINING_DURATION - elapsed });
        }

        // Add Balance and Reset Timer
        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET balance = balance + ?, mining_started_at = NULL WHERE telegram_id = ?', [REWARD, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Give Referral Bonus if applicable
        if (user.referrer_id) {
             await new Promise((resolve, reject) => {
                db.run('UPDATE users SET balance = balance + ? WHERE telegram_id = ?', [REFERRAL_BONUS, user.referrer_id], (err) => {
                    if (err) reject(err); // Log error but don't fail the claim
                    else resolve();
                });
            });
        }

        const updatedUser = await getUser(id);
        res.json({ success: true, balance: updatedUser.balance });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await new Promise((resolve, reject) => {
            db.all('SELECT username, first_name, balance FROM users ORDER BY balance DESC LIMIT 10', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Friends List
app.get('/api/friends/:id', async (req, res) => {
    try {
        const friends = await new Promise((resolve, reject) => {
            db.all('SELECT username, first_name FROM users WHERE referrer_id = ?', [req.params.id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        res.json(friends);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
