# Real-Time Process Monitoring Dashboard

A cross-platform, real-time operating system dashboard built to visualize system health, track # Real-Time Process Monitoring Dashboard

A cross-platform, real-time operating system dashboard built to visualize system health, track resource consumption, and manage active processes. Created as a comprehensive project demonstrating core Operating Systems concepts.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue) ![Tech Stack](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green) ![Tech Stack](https://img.shields.io/badge/Real--Time-Socket.io-black) ![Tech Stack](https://img.shields.io/badge/OS-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## 🌟 Features

- **Live System Metrics:** Real-time visualization of overall CPU load (per core) and Memory (RAM) utilization using interactive charts.
- **Process Tracking:** Dynamic, alphabetically sorted table of active processes displaying PID, Name, State, CPU %, and Memory %.
- **Process Management:** Ability to securely terminate running processes directly from the UI using OS-level `SIGKILL` signals.
- **Cross-Platform Compatibility:** Runs seamlessly on Windows, macOS, and Linux without requiring OS-specific code changes.
- **One-Click Execution:** Automated startup scripts initialize dependencies, boot servers, and launch the dashboard in your default browser.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Recharts (SVG Data Visualization)
- **Backend:** Node.js (ES Modules), Express.js
- **Real-Time Data Stream:** Socket.io (WebSockets)
- **OS Abstraction:** Systeminformation (NPM)

## 📂 Project Structure

This project is structured as a monorepo containing both the backend and frontend environments.

```text
os-process-dashboard/
│
├── backend/               # Node.js Data Engine & WebSocket Server
│   ├── app.mjs            # Core server logic and OS interactions
│   └── package.json
│
├── frontend/              # React.js UI
│   ├── src/
│   │   ├── App.jsx        # Main dashboard view and Socket listener
│   │   └── App.css        # Dashboard styling
│   └── package.json
│
├── start.bat              # One-click startup script for Windows
├── start.sh               # One-click startup script for macOS/Linux
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher) installed on your machine.

## The "One-Click" Setup (Recommended)

You do not need to manually install dependencies. The automated scripts will handle everything.

### For Windows:

1. Navigate to the project root folder.
2. Double-click the `start.bat` file.
3. The script will install packages, boot the servers, and automatically open your default web browser.

### For macOS / Linux:

1. Open your terminal and navigate to the project root folder.
2. Make the script executable: `chmod +x start.sh`
3. Run the script: `./start.sh`
4. The script will handle dependencies, boot the servers in the background, and open your browser. Press `Ctrl+C` in the terminal to cleanly shut down the application.

### Manual Setup

If you prefer to run the application manually in separate terminal windows:

**1. Start the Backend:**

```bash
cd backend
npm install
npm run dev
```

**2. Start the Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

## 📡 System Architecture & Data Flow

### REST API

- **`GET /api/system`**: Fetches a single JSON snapshot of current CPU, Memory, and Process data.
- **`POST /api/kill`**: Accepts a JSON payload `{ "pid": 12345 }` and attempts to forcefully terminate the process using the OS `SIGKILL` signal.

### WebSocket Stream

When the React frontend connects, the backend initializes an OS monitoring loop.

- **Event:** `os-metrics`
- **Frequency:** Every 1000ms
- **Optimization:** The loop only runs when at least one client is connected via WebSockets to prevent background CPU drain.

## ⚠️ Important OS Permissions Note

The "Kill Process" feature interacts directly with kernel-level commands.

- **Windows:** You may not be able to terminate system-level processes (e.g., `svchost.exe`) unless the application is launched from an **Administrator** terminal.
- **Mac/Linux:** Terminating processes owned by root requires running the Node.js backend with `sudo`.
- _Note: The application handles permission rejections gracefully and will display a `403 Access Denied` UI banner if the OS blocks the request._
