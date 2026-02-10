#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Starting Pulse Miner from $DIR..."

# Start Backend
cd "$DIR/backend" && npm start &
BACKEND_PID=$!
echo "Backend started on port 3000 (PID: $BACKEND_PID)"

# Start Frontend
cd "$DIR/frontend" && npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Trap Ctrl+C to kill both
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

wait
