import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// 1. Establish the WebSocket connection outside the component
// This prevents React from creating a new connection every time the UI re-renders.
const socket = io('http://localhost:5000');

function App() {
  // 2. State Management
  const [osData, setOsData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [ramHistory, setRamHistory] = useState([]); // <-- NEW: Array to hold historical RAM data

// 3. The WebSocket Listener
  // useEffect(() => {
  //   socket.on('os-metrics', (data) => {
      
  //     // CHANGE: Sort processes by Name alphabetically for UI stability
  //     if (data.processes) {
  //       data.processes.sort((a, b) => {
  //         // Fallback to an empty string just in case the OS returns an undefined name
  //         const nameA = a.name || "";
  //         const nameB = b.name || "";
          
  //         return nameA.localeCompare(nameB);
  //       });
  //     }
      
  //     setOsData(data);
  //   });

  //   return () => {
  //     socket.off('os-metrics');
  //   };
  // }, []);
  
  // 3. The WebSocket Listener
  useEffect(() => {
    socket.on('os-metrics', (data) => {
      if (data.processes) {
        data.processes.sort((a, b) => {
          const nameA = a.name || "";
          const nameB = b.name || "";
          return nameA.localeCompare(nameB);
        });
      }
      setOsData(data);

      // --- NEW: Track RAM History for the Line Chart ---
      setRamHistory(prevHistory => {
        const usedGb = parseFloat((data.memory.used / 1073741824).toFixed(2));
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: "numeric", 
          minute: "numeric", 
          second: "numeric" 
        });

        const newPoint = { time: timestamp, used: usedGb };
        const updatedHistory = [...prevHistory, newPoint];
        
        // Keep only the last 20 data points to keep the chart clean
        return updatedHistory.slice(-20); 
      });

    });

    return () => {
      socket.off('os-metrics');
    };
  }, []);

  // Show a loading screen until the first packet of data arrives from the backend
  if (!osData) return <div className="loading">Connecting to OS Engine...</div>;
  
// 4. Process Control Function
  const killProcess = async (pid) => {
    // Safety check: Ask the user to confirm before sending the SIGKILL command
    if (!window.confirm(`Are you sure you want to terminate Process ID: ${pid}?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      });

      const result = await response.json();

      if (!response.ok) {
        // If the OS blocked it (403 or 404), display the error banner for 5 seconds
        setErrorMessage(`Error: ${result.message}`);
        setTimeout(() => setErrorMessage(""), 5000);
      } else {
        // Success! We don't need to manually update the table because the next 
        // 1-second WebSocket pulse will automatically reflect the closed process.
        console.log(`Killed ${pid}`);
      }
    } catch (error) {
      setErrorMessage("Network error: Could not reach the backend.");
    }
  };

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
            <ResponsiveContainer width="100%" height={450}>
              {/* <BarChart data={osData.cpu.cores.map((load, index) => ({ name: `Core ${index}`, load }))}> */}
              <BarChart data={osData.cpu.cores.map((load, index) => ({ name: `Core ${index+1}`, load }))}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }} >
                {/* <XAxis dataKey="name" stroke="#8884d8" /> */}
                <XAxis 
                  dataKey="name" 
                  stroke="#8884d8" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} tickCount={11} interval={0}/>
                <Tooltip />
                {/* Dynamically color the bar red if load is > 80% */}
                <Bar dataKey="load">
                  {osData.cpu.cores.map((load, index) => {
                    // Math Trick: HSL colors (Hue, Saturation, Lightness). 
                    // Hue 120 is Green, Hue 60 is Yellow, Hue 0 is Red.
                    // As load goes from 0 to 100, the Hue smoothly drops from 120 to 0.
                    const dynamicHue = (1 - (load / 100)) * 120;
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${dynamicHue}, 100%, 45%)`} 
                      />
                    );
                  })}
                </Bar>              
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* --- MEMORY USAGE (LINE CHART) --- */}
        <div className="card">
          <h2>Memory Consumption (RAM)</h2>
          <div className="memory-stats">
            <p><strong>Total:</strong> {(osData.memory.total / 1073741824).toFixed(2)} GB </p>
            <p><strong>Used:</strong> {(osData.memory.used / 1073741824).toFixed(2)} GB </p>
            <p><strong>Free:</strong> {(osData.memory.free / 1073741824).toFixed(2)} GB </p>
          </div>
          
          <div className="chart-container" style={{ marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={ramHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="time" stroke="#8884d8" fontSize={12} />
                {/* Dynamically set the Y-Axis max to the total RAM of the host machine */}
                <YAxis domain={[0, Math.ceil(osData.memory.total / 1073741824)]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="used" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false} 
                  isAnimationActive={false} // Disable animation so it scrolls smoothly
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>


      {/* --- PROCESS LIST TABLE --- */}
      <div className="card full-width">
        <h2>Active Processes</h2>
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
              {osData.processes.map((proc) => (
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