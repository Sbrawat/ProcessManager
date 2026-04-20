# Backend: Real-Time Process Monitoring Dashboard ⚙️

This directory contains the Node.js/Express backend for the Real-Time Process Monitoring Dashboard. It is responsible for securely interfacing with the host Operating System, retrieving hardware metrics, and streaming that data in real-time to the React frontend via WebSockets.

## 🛠️ Tech Stack

- **Runtime:** Node.js (Using ES Modules / `.mjs`)
- **Web Framework:** Express.js
- **Real-Time Engine:** Socket.io
- **OS Abstraction:** `systeminformation`
- **Development:** Nodemon

## 📂 Backend Structure

```text
backend/
├── app.mjs           # Main application entry point (ESM)
├── package.json      # Dependencies and scripts
└── package-lock.json # Dependency tree

```
