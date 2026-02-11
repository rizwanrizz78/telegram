import { useState, useEffect } from 'react';
import axios from 'axios';

function Home({ user, setUser }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [mining, setMining] = useState(false);
  const [canClaim, setCanClaim] = useState(false);

  const MINING_DURATION = 4 * 60 * 60 * 1000;

  useEffect(() => {
    if (!user) return;

    if (user.mining_started_at) {
      setMining(true);
      const start = user.mining_started_at;
      const now = Date.now();
      const elapsed = now - start;

      if (elapsed >= MINING_DURATION) {
        setCanClaim(true);
        setTimeLeft(0);
      } else {
        setTimeLeft(MINING_DURATION - elapsed);
        setCanClaim(false);
      }
    } else {
      setMining(false);
      setCanClaim(false);
      setTimeLeft(0);
    }
  }, [user]);

  useEffect(() => {
    if (mining && timeLeft > 0 && !canClaim) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            setCanClaim(true);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mining, timeLeft, canClaim]);

  const startMining = async () => {
    try {
      const res = await axios.post('/api/mine/start', { id: user.telegram_id });
      if (res.data.success) {
        setUser({ ...user, mining_started_at: res.data.mining_started_at });
      }
    } catch (e) {
      console.error(e);
      alert('Error starting mine');
    }
  };

  const claim = async () => {
    try {
      const res = await axios.post('/api/mine/claim', { id: user.telegram_id });
      if (res.data.success) {
        setUser({ ...user, balance: res.data.balance, mining_started_at: null });
        setMining(false);
        setCanClaim(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error claiming');
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (!user) return <div className="loading">Syncing...</div>;

  return (
    <div className="home-container" style={{ textAlign: 'center', width: '100%' }}>
      <h1>PULSE MINER</h1>

      <div className="pixel-card" style={{ margin: '0 auto' }}>
        <h2>BALANCE</h2>
        <div style={{ fontSize: '3rem', color: 'var(--neon-green)' }}>
          {user.balance.toLocaleString()} $PULSE
        </div>
      </div>

      <div className="heart-icon">♥</div>

      <div className="pixel-card" style={{ margin: '2rem auto' }}>
        <h3>STATUS</h3>
        {mining ? (
          canClaim ? (
            <div>
              <p style={{ color: 'var(--neon-green)' }}>MINING COMPLETE!</p>
              <button className="pixel-btn claim-btn" onClick={claim}>
                CLAIM 25 $PULSE
              </button>
            </div>
          ) : (
            <div>
              <p>MINING IN PROGRESS...</p>
              <p style={{ fontSize: '2rem' }}>{formatTime(timeLeft)}</p>
              <button className="pixel-btn" disabled>
                MINING...
              </button>
            </div>
          )
        ) : (
          <div>
            <p>READY TO MINE</p>
            <button className="pixel-btn" onClick={startMining}>
              START MINING
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
