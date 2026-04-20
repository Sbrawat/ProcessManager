#!/bin/bash

echo "==================================================="
echo "  Initializing Real-Time OS Monitoring Dashboard"
echo "==================================================="

echo -e "\n[1/3] Checking and installing Backend dependencies..."
cd backend
npm install

echo -e "\n[2/3] Checking and installing Frontend dependencies..."
cd ../frontend
npm install

echo -e "\n[3/3] Starting Servers..."
cd ..

# --- THE CLEANUP TRAP ---
# If the user presses Ctrl+C to quit, we MUST kill the background servers.
# Otherwise, ports 5000 and 5173 will be permanently blocked.
trap 'echo -e "\nShutting down servers..."; kill %1; kill %2; exit' SIGINT

# Start the Express backend in the background (&)
cd backend
npm run dev &

# Start the Vite React frontend in the background (&)
cd ../frontend
npm run dev &

echo -e "\nSUCCESS! Application is running."
echo "Navigate to http://localhost:5173 in your web browser."
echo "Press Ctrl+C in this terminal to stop both servers."

# Wait keeps the script running so the background processes stay alive
wait