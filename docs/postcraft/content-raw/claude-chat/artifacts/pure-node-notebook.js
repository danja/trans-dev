// server.js
const express = require('express');
const { VM } = require('vm2');
const WebSocket = require('ws');
const app = express();
const wss = new WebSocket.Server({ noServer: true });

app.use(express.static('public'));

// Sandbox for code execution
function createSandbox() {
    return new VM({
        timeout: 1000,
        sandbox: {
            require: require,
            console: {
                log: (...args) => ({type: 'output', content: args.join(' ')}),
                error: (...args) => ({type: 'error', content: args.join(' ')})
            }
        }
    });
}

wss.on('connection', (ws) => {
    const sandbox = createSandbox();
    
    ws.on('message', async (message) => {
        try {
            const code = message.toString();
            const result = await sandbox.run(code);
            ws.send(JSON.stringify({
                status: 'success',
                result: result
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                status: 'error',
                error: error.message
            }));
        }
    });
});

const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Optional: Add package management
const npm = require('npm');
app.post('/install', express.json(), (req, res) => {
    const { package } = req.body;
    npm.load(() => {
        npm.commands.install([package], (err) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ status: 'success' });
        });
    });
});
