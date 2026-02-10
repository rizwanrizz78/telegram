import { useState, useEffect } from 'react';
import axios from 'axios';

function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.telegram_id) {
      axios.get(`/api/friends/${user.telegram_id}`)
        .then(res => {
          setFriends(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const copyLink = () => {
    const link = `https://t.me/YourBotName?start=${user.telegram_id}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  return (
    <div className="friends-container" style={{ width: '100%', textAlign: 'center' }}>
      <h1>FRIENDS</h1>

      <div className="pixel-card" style={{ margin: '0 auto' }}>
        <h3>INVITE FRIENDS</h3>
        <p>Earn 5 $PULSE for every friend who mines!</p>
        <button className="pixel-btn" onClick={copyLink}>
          COPY INVITE LINK
        </button>
      </div>

      <div className="pixel-card" style={{ margin: '2rem auto', textAlign: 'left' }}>
        <h3>YOUR SQUAD ({friends.length})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {friends.map((friend, index) => (
              <li key={index} style={{ borderBottom: '1px solid #333', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{friend.first_name}</span>
                <span style={{ color: 'var(--neon-green)' }}>+5 PULSE</span>
              </li>
            ))}
            {friends.length === 0 && <p>No friends yet. Invite some!</p>}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Friends;
