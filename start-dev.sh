#!/bin/bash

# Start the debug server in the background
echo "Starting debug server..."
npx tsx debug-server.ts &
DEBUG_PID=$!

# Wait a moment for the debug server to start
sleep 2

# Start Vite dev server
echo "Starting Vite dev server..."
npm run dev

# When Vite exits, kill the debug server
kill $DEBUG_PID