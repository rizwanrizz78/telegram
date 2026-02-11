import { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/leaderboard')
      .then(res => {
        setLeaders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="leaderboard-container" style={{ width: '100%', textAlign: 'center' }}>
      <h1>LEADERBOARD</h1>

      <div className="pixel-card" style={{ margin: '0 auto', textAlign: 'left' }}>
        <h3>TOP 10 MINERS</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {leaders.map((leader, index) => (
              <li key={index} style={{
                borderBottom: '1px solid #333',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'inherit'
              }}>
                <span>#{index + 1} {leader.first_name || leader.username}</span>
                <span>{leader.balance.toLocaleString()}</span>
              </li>
            ))}
            {leaders.length === 0 && <p>No leaders yet. Be the first!</p>}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
