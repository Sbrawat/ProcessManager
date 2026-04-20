import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// 1. Establish the WebSocket connection outside the component
// This prevents React from creating a new connection every time the UI re-renders.
const socket = io('http://localhost:5000');

function App() {
  // 2. State Management
  const [osData, setOsData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // 3. The WebSocket Listener
  useEffect(() => {
    // Listen for the custom event we created in the Node backend
    socket.on('os-metrics', (data) => {
      // Sort processes by CPU usage (Descending) so the heaviest tasks are always at the top
      if (data.processes) {
        data.processes.sort((a, b) => b.cpu - a.cpu);
      }
      setOsData(data);
    });

    // Cleanup function: If the component unmounts, stop listening to prevent memory leaks
    return () => {
      socket.off('os-metrics');
    };
  }, []);

  // Show a loading screen until the first packet of data arrives from the backend
  if (!osData) return <div className="loading">Connecting to OS Engine...</div>;

return (
    <div className="dashboard">
      <header>
        <h1>⚙️ Real-Time OS Dashboard</h1>
        {errorMessage && <div className="error-banner">{errorMessage}</div>}
      </header>

      <div className="system-health-grid">
        {/* --- CPU CORES CHART --- */}
        <div className="card">
          <h2>CPU Load per Core (%)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={osData.cpu.cores.map((load, index) => ({ name: `Core ${index}`, load }))}>
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                {/* Dynamically color the bar red if load is > 80% */}
                <Bar dataKey="load" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- MEMORY USAGE --- */}
        <div className="card">
          <h2>Memory Consumption (RAM)</h2>
          <div className="memory-stats">
            <p><strong>Total:</strong> {(osData.memory.total / 1073741824).toFixed(2)} GB</p>
            <p><strong>Used:</strong> {(osData.memory.used / 1073741824).toFixed(2)} GB</p>
            <p><strong>Free:</strong> {(osData.memory.free / 1073741824).toFixed(2)} GB</p>
          </div>
          {/* A simple visual progress bar for RAM */}
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(osData.memory.used / osData.memory.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* --- PROCESS LIST TABLE --- */}
      <div className="card full-width">
        <h2>Active Processes (Top 50)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>PID</th>
                <th>Name</th>
                <th>State</th>
                <th>CPU %</th>
                <th>RAM %</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Only render the top 50 processes to prevent the browser from lagging */}
              {osData.processes.slice(0, 50).map((proc) => (
                <tr key={proc.pid}>
                  <td>{proc.pid}</td>
                  <td>{proc.name}</td>
                  <td><span className={`state ${proc.state}`}>{proc.state}</span></td>
                  <td>{proc.cpu.toFixed(1)}%</td>
                  <td>{proc.mem.toFixed(1)}%</td>
                  <td>
                    <button onClick={() => killProcess(proc.pid)} className="kill-btn">
                      Kill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;