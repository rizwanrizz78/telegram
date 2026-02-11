import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Friends from './pages/Friends';
import Leaderboard from './pages/Leaderboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Mock Telegram WebApp for development if not available
      if (!window.Telegram?.WebApp?.initData) {
         // Mock user for testing in browser without Telegram
         console.warn("Telegram WebApp not detected. Using Mock Data.");
         const mockUser = {
             id: '12345',
             first_name: 'Dev',
             last_name: 'User',
             username: 'dev_user',
             start_param: ''
         };
         // Call auth with mock data
         try {
             const res = await axios.post('/api/auth', mockUser);
             setUser(res.data);
         } catch (e) {
             console.error("Auth failed", e);
         }
         setLoading(false);
         return;
      }

      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const telegramUser = webApp.initDataUnsafe.user;
      const startParam = webApp.initDataUnsafe.start_param;

      if (telegramUser) {
        try {
          const res = await axios.post('/api/auth', {
            id: telegramUser.id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            start_param: startParam
          });
          setUser(res.data);
        } catch (error) {
          console.error("Auth failed", error);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  if (loading) return <div className="loading">Loading Pulse...</div>;

  return (
    <Router>
      <div className="app-container">
        <main className="content">
          <Routes>
            <Route path="/" element={<Home user={user} setUser={setUser} />} />
            <Route path="/friends" element={<Friends user={user} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            ⛏ Mine
          </NavLink>
          <NavLink to="/friends" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            👥 Friends
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            🏆 Top
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

export default App;
