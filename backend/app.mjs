import express from 'express';
import cors from 'cors';
import si from 'systeminformation';

// Initialize the Express application
const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- OS DATA FETCHING LOGIC ---
async function getSystemData() {
    try {
        const [cpu, mem, procs] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.processes()
        ]);

        return {
            cpu: {
                currentLoad: cpu.currentLoad,
                cores: cpu.cpus.map(c => c.load)
            },
            memory: {
                total: mem.total,
                used: mem.active,
                free: mem.available
            },
            processes: procs.list.map(p => ({
                pid: p.pid,
                name: p.name,
                state: p.state,
                cpu: p.cpu,
                mem: p.mem
            }))
        };
    } catch (error) {
        console.error("Error fetching system data:", error);
        return null;
    }
}

// --- TEST DATA ENDPOINT (will be removed later) ---
app.get('/api/system', async (req, res) => {
    const data = await getSystemData();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ success: false, message: "Failed to fetch system data" });
    }
});

// --- TEST API/KILL ENDPOINT ---
//curl -X POST http://localhost:5000/api/kill -H "Content-Type: application/json" -d "{\"pid\": 12345}"

// --- PROCESS CONTROL ENDPOINT ---
app.post('/api/kill', (req, res) => {
    const { pid } = req.body;

    if (!pid) {
        return res.status(400).json({ success: false, message: "PID is required" });
    }

    try {
        process.kill(pid, 'SIGKILL');
        console.log(`Successfully killed process: ${pid}`);
        res.json({ success: true, message: `Process ${pid} terminated.` });
        
    } catch (error) {
        console.error(`Failed to kill process ${pid}:`, error.message);
        
        if (error.code === 'EPERM') {
            res.status(403).json({ success: false, message: "Access Denied. Run backend as Administrator/Root." });
        } else if (error.code === 'ESRCH') {
            res.status(404).json({ success: false, message: "Process not found. It may have already closed." });
        } else {
            res.status(500).json({ success: false, message: "Failed to terminate process due to a system error." });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Ready to monitor OS processes...`);
});