# Project Prawn — Live Multiplayer

This version lets people connected to the same hosted server fight each other in real time. It uses a Node.js WebSocket server; it is not a local-only simulation.

## Run on your computer
1. Install Node.js 18 or newer.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open http://localhost:3000 in two or more browser tabs/devices on the same network. For other devices, use the host computer's LAN IP and allow port 3000 through its firewall.

## Put it online
Deploy this folder to a Node-capable host that supports persistent WebSocket connections (for example Render, Railway, or Fly.io). Set the start command to `npm start`. Share the deployed HTTPS website URL; the browser automatically uses secure WebSockets (`wss://`) on HTTPS.

## Controls
WASD/arrows move; mouse aims; left click/Space fires; Shift sprints. If eliminated, use Respawn.

## Notes
- This is a starter real-time multiplayer prototype, not a production-scale matchmaking service.
- Players share one global arena. There are no accounts, ranked queues, persistence, anti-cheat guarantees, or voice chat.
- The server owns movement, firing, hit detection, and health updates. Add authentication, rate limits, room matchmaking, and stronger validation before public competitive deployment.
