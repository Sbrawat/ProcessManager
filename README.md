# Process Manager: Real-Time Process Monitoring Dashboard 🖥️

A cross-platform, real-time operating system dashboard built to visualize system health, track resource consumption, and manage active processes.

## Features

- **Live System Metrics:** Real-time visualization of overall CPU load and Memory (RAM) utilization.
- **Process Tracking:** Dynamic table of active processes displaying PID, Name, State, CPU %, and Memory %.
- **Process Management:** Ability to securely terminate running processes directly from the UI (requires appropriate OS permissions).
- **Cross-Platform Compatibility:** Runs seamlessly on Windows, macOS, and Linux without requiring OS-specific code changes.

## Tech Stack

- **Frontend:** React.js, Vite, Recharts (for data visualization)
- **Backend:** Node.js, Express.js
- **Real-Time Data Stream:** Socket.io (WebSockets)
- **OS Abstraction:** Systeminformation

## Project Structure

This is a monorepo containing both the backend and frontend.

```text
os-process-dashboard/
├── backend/       # Express.js server & OS data fetcher
└── frontend/      # React.js UI & WebSocket client
```
