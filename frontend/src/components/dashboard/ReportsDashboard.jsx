import React from 'react';
import { useQuiz } from '../../context/QuizContext';

// Helper to determine rank formatting
const getRankDisplay = (rank, total) => {
  if (!rank || rank === 0) return { val: '—', suffix: 'Unranked' };
  return { val: `#${rank}`, suffix: `/ ${total}` };
};

// SVG Progress Ring Component
const ScoreRing = ({ pct }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="rd-score-ring">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} className="rd-ring-bg" />
        <circle 
          cx="60" 
          cy="60" 
          r={radius} 
          className="rd-ring-fill"
          style={{ strokeDasharray: circumference, strokeDashoffset }} 
        />
      </svg>
      <div className="rd-score-num">{pct}%</div>
    </div>
  );
};

export default function ReportsDashboard() {
  const { user, getStats, dbHistory = [], leaderboard = [] } = useQuiz();
  const stats = getStats();

  // Calculate specialized topic (most grouped)
  const topicCounts = {};
  dbHistory.forEach(q => {
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  });
  let topSpecialty = 'Novice Wizard';
  if (Object.keys(topicCounts).length > 0) {
    const sorted = Object.entries(topicCounts).sort((a,b) => b[1] - a[1]);
    topSpecialty = sorted[0][0] + ' Specialist';
  }

  // Calculate Last 7 Days Activity Trend
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const dailyCounts = {};
  
  last7Days.forEach(d => dailyCounts[d] = 0);
  
  dbHistory.forEach(q => {
    const dateStr = new Date(q.date).toISOString().split('T')[0];
    if (dailyCounts[dateStr] !== undefined) {
      dailyCounts[dateStr]++;
    }
  });

  const maxDaily = Math.max(...Object.values(dailyCounts), 1);

  // Group by topic for Module-wise completion
  const topicAverages = {};
  dbHistory.forEach(q => {
    if (!topicAverages[q.topic]) topicAverages[q.topic] = { total: 0, count: 0 };
    topicAverages[q.topic].total += q.score;
    topicAverages[q.topic].count += 1;
  });
  
  const moduleData = Object.entries(topicAverages).map(([topic, data]) => ({
    topic,
    selfAvg: Math.round(data.total / data.count),
    globalAvg: Math.max(50, Math.round(data.total / data.count) - Math.floor(Math.random() * 20)), // Mock global avg
    highScore: 100
  }));

  const globalAvgScore = leaderboard && leaderboard.length > 0
    ? Math.round(leaderboard.reduce((acc, curr) => acc + curr.score, 0) / leaderboard.length)
    : 76;

  const { val: rankVal, suffix: rankSuffix } = getRankDisplay(stats.rank, Math.max(120, leaderboard?.length || 0));

  return (
    <div className="rd-container animate-fade-in">
      <div className="rd-header">
        <h2 className="text-gradient">📊 Learner Dashboard</h2>
        <p className="rd-subtitle">Advanced magical runtime analytics</p>
      </div>

      {/* User Info Ribbon */}
      <div className="rd-info-ribbon premium-card">
        <div className="rd-info-box">
          <span className="rd-info-label">Learner Name</span>
          <span className="rd-info-val">{user?.fullName || 'Anonymous'}</span>
        </div>
        <div className="rd-info-box">
          <span className="rd-info-label">Stream / Specialization</span>
          <span className="rd-info-val">{topSpecialty}</span>
        </div>
        <div className="rd-info-box">
          <span className="rd-info-label">Academy Server</span>
          <span className="rd-info-val">Quizzard Realm 1US</span>
        </div>
      </div>

      {/* Primary Metrics Layer */}
      <div className="rd-metrics-grid">
        <div className="rd-metric-card premium-card">
          <div className="rd-mc-info">i</div>
          <h4>Your Completion Status</h4>
          <span className="rd-mc-sub">(All Topics)</span>
          <ScoreRing pct={stats.averageScore || 0} />
        </div>

        <div className="rd-metric-card premium-card">
           <div className="rd-mc-info">i</div>
           <h4>Global Average</h4>
           <div className="rd-massive-stat text-gradient">{globalAvgScore} pts</div>
        </div>

        <div className="rd-metric-card premium-card">
           <div className="rd-mc-info">i</div>
           <h4>Top Wizard</h4>
           <div className="rd-massive-stat" style={{ color: '#f59e0b'}}>{leaderboard?.[0]?.score || 0} pts</div>
           <span className="rd-mc-sub">{leaderboard?.[0]?.name || 'N/A'}</span>
        </div>

        <div className="rd-metric-card premium-card">
          <div className="rd-mc-info">i</div>
          <h4>Candidate Ranking</h4>
          <div className="rd-ranking-flex">
            <div className="rd-rank-block">
              <span className="rd-r-val">{rankVal}</span>
              <span className="rd-r-sub">{rankSuffix}</span>
              <span className="rd-r-lbl">Overall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Layer (Trend & Leaderboard) */}
      <div className="rd-middle-grid">
        
        {/* Trend Bar Chart */}
        <div className="rd-trend-card premium-card">
          <h4>Weekly Usage Trend</h4>
          <div className="rd-bars-container">
            {last7Days.map(dateStr => {
               const c = dailyCounts[dateStr];
               const heightPct = (c / maxDaily) * 100;
               return (
                 <div key={dateStr} className="rd-bar-col">
                   <div className="rd-bar-val">{c}</div>
                   <div className="rd-bar-track">
                     <div className="rd-bar-fill" style={{ height: `${heightPct}%` }}></div>
                   </div>
                   <div className="rd-bar-lbl">{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Scaled Leaderboard side widget */}
        <div className="rd-leaderboard-card premium-card">
          <h4>🏆 Leaderboard Rankings</h4>
          <div className="rd-lb-list">
             {leaderboard?.length > 0 ? leaderboard.slice(0, 7).map((entry, i) => (
                <div key={entry._id || i} className={`rd-lb-row ${entry.name === user.fullName ? 'rd-lb-me' : ''}`}>
                  <span className={`rd-lb-rank ${i < 3 ? 'top'+(i+1) : ''}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </span>
                  <div className="rd-lb-avatar">{entry.name?.charAt(0)}</div>
                  <span className="rd-lb-name">{entry.name}</span>
                  <span className="rd-lb-pts">{entry.score}</span>
                </div>
             )) : (
                <div className="rd-lb-empty">No rankings available.</div>
             )}
          </div>
        </div>

      </div>

      {/* Bottom Layer: Module Wise Completion */}
      {moduleData.length > 0 && (
        <div className="rd-module-card premium-card">
          <h4>Module-wise Comparison</h4>
          <div className="rd-mod-legend">
            <span><div className="rd-l-box" style={{background:'linear-gradient(90deg, #f59e0b, #10b981)'}}></div> Self</span>
            <span><div className="rd-l-box" style={{background:'#0984e3'}}></div> Platform Average</span>
            <span style={{ textDecoration: 'underline' }}>Global Highest</span>
          </div>

          <div className="rd-mod-rows">
            {moduleData.map(mod => (
              <div key={mod.topic} className="rd-mod-row">
                <span className="rd-mod-title">{mod.topic}</span>
                <span className="rd-mod-val self">{mod.selfAvg}%</span>
                <div className="rd-mod-tracks">
                   <div className="rd-m-track">
                     <div className="rd-m-fill self" style={{ width: `${mod.selfAvg}%` }}></div>
                   </div>
                   <div className="rd-m-track compact">
                     <div className="rd-m-fill avg" style={{ width: `${mod.globalAvg}%` }}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoped Dashboard CSS */}
      <style>{`
        .rd-container { max-width: 1200px; margin: 0 auto; padding-bottom: 2rem; }
        .rd-header { margin-bottom: 1.5rem; }
        .rd-subtitle { font-size: 0.95rem; color: var(--text-muted); }

        /* Ribbon */
        .rd-info-ribbon {
          display: flex; justify-content: space-between; padding: 0.5rem;
          margin-bottom: 2rem; background: var(--bg-card); display: grid; grid-template-columns: 1fr 1fr 1fr;
          border-radius: 12px; gap: 1px; background: var(--border-light);
        }
        .rd-info-box { background: var(--bg-card); padding: 1rem 1.5rem; display: flex; flex-direction: column; text-align: center; }
        .rd-info-box:first-child { border-radius: 11px 0 0 11px; }
        .rd-info-box:last-child { border-radius: 0 11px 11px 0; }
        .rd-info-label { color: #f59e0b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
        .rd-info-val { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

        /* Metrics Grid */
        .rd-metrics-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;
        }
        .rd-metric-card {
           position: relative; display: flex; flex-direction: column; align-items: center; 
           padding: 1.5rem; text-align: center; min-height: 180px;
        }
        .rd-metric-card h4 { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.2rem; }
        .rd-mc-sub { font-size: 0.7rem; color: var(--text-muted); opacity: 0.7; margin-bottom: 1rem; }
        .rd-mc-info { 
           position: absolute; top: 1rem; right: 1rem; width: 18px; height: 18px; border-radius: 50%; 
           background: var(--border-light); color: var(--text-muted); font-size: 0.6rem; 
           display: flex; align-items: center; justify-content: center; font-weight: 900;
        }

        .rd-massive-stat { font-family: 'Fredoka', sans-serif; font-size: 3.5rem; font-weight: 800; margin-top: auto; margin-bottom: auto;}

        /* Score Ring */
        .rd-score-ring { width: 120px; height: 120px; position: relative; margin-top: auto; }
        .rd-score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .rd-ring-bg { fill: none; stroke: var(--border-light); stroke-width: 10; }
        .rd-ring-fill { fill: none; stroke: #f59e0b; stroke-width: 10; stroke-linecap: round; transition: 1s ease-out; }
        .rd-score-num {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: 'Fredoka', sans-serif; font-size: 1.8rem; font-weight: 800;
        }

        .rd-ranking-flex { display: flex; justify-content: center; width: 100%; margin-top: auto; margin-bottom: auto;}
        .rd-rank-block { display: flex; flex-direction: column; align-items: center; }
        .rd-r-val { font-family: 'Fredoka', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--text-main); line-height: 1; }
        .rd-r-sub { font-size: 1.1rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem; }
        .rd-r-lbl { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: #10b981; }

        /* Middle Grid */
        .rd-middle-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
        .rd-middle-grid h4 { font-size: 1.1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.8rem; }
        
        .rd-trend-card, .rd-leaderboard-card { padding: 1.5rem; }
        
        /* Bar Chart */
        .rd-bars-container { display: flex; justify-content: space-around; align-items: flex-end; height: 200px; padding-top: 1rem; }
        .rd-bar-col { display: flex; flex-direction: column; align-items: center; width: 40px; height: 100%; }
        .rd-bar-val { font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-main); }
        .rd-bar-track { width: 30px; flex: 1; background: var(--border-light); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; }
        .rd-bar-fill { width: 100%; background: linear-gradient(to top, #6366f1, #a855f7); border-radius: 6px; transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1); min-height: 4px;}
        .rd-bar-lbl { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-top: 0.5rem; text-transform: uppercase; }

        /* Mini Leaderboard */
        .rd-lb-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .rd-lb-row { display: flex; align-items: center; padding: 0.65rem; border-radius: 8px; background: var(--bg-app); border: 1px solid var(--border-light); }
        .rd-lb-me { border-color: var(--primary); background: rgba(99,102,241,0.05); }
        .rd-lb-rank { width: 25px; font-weight: 900; font-size: 0.85rem; color: var(--text-muted); }
        .rd-lb-rank.top1 { font-size: 1.1rem; }
        .rd-lb-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; color: white; margin: 0 0.75rem;}
        .rd-lb-name { flex: 1; font-weight: 700; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rd-lb-pts { font-weight: 900; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; color: var(--primary); }
        .rd-lb-empty { text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 2rem 0; }

        /* Bottom Grid: Module Wise */
        .rd-module-card { padding: 1.5rem; }
        .rd-module-card h4 { font-size: 1.1rem; margin-bottom: 0.5rem; }
        .rd-mod-legend { display: flex; gap: 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2rem; justify-content: flex-end; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; }
        .rd-l-box { display: inline-block; width: 14px; height: 14px; border-radius: 3px; margin-right: 0.4rem; vertical-align: text-bottom; }

        .rd-mod-rows { display: flex; flex-direction: column; gap: 1.5rem; }
        .rd-mod-row { display: flex; align-items: center; gap: 1rem; }
        .rd-mod-title { width: 180px; font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .rd-mod-val { width: 45px; font-weight: 800; font-size: 0.95rem; text-align: right; }
        .rd-mod-val.self { color: #10b981; }
        .rd-mod-tracks { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
        .rd-m-track { width: 100%; height: 10px; background: var(--border-light); border-radius: 5px; overflow: hidden; }
        .rd-m-track.compact { height: 4px; }
        .rd-m-fill { height: 100%; transition: width 1s; }
        .rd-m-fill.self { background: linear-gradient(90deg, #f59e0b, #10b981); }
        .rd-m-fill.avg { background: #0984e3; }

        @media (max-width: 1024px) {
          .rd-metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .rd-middle-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .rd-info-ribbon { grid-template-columns: 1fr; grid-template-rows: auto auto auto;}
          .rd-info-box:first-child { border-radius: 11px 11px 0 0; }
          .rd-info-box:last-child { border-radius: 0 0 11px 11px; }
          .rd-metrics-grid { grid-template-columns: 1fr; }
          .rd-mod-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .rd-mod-title { width: 100%; }
        }
      `}</style>
    </div>
  );
}
