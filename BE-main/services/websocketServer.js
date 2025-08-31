const WebSocket = require('ws');

class ChatWebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map of projectId -> Set of WebSocket connections
        
        this.wss.on('connection', (ws, req) => {
            console.log('New WebSocket connection');
            
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });

            ws.on('close', () => {
                // Remove client from all project rooms
                for (const [projectId, clients] of this.clients.entries()) {
                    clients.delete(ws);
                    if (clients.size === 0) {
                        this.clients.delete(projectId);
                    }
                }
                console.log('WebSocket connection closed');
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });

        // Heartbeat to keep connections alive
        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (!ws.isAlive) {
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

    handleMessage(ws, data) {
        switch (data.type) {
            case 'join_project':
                this.joinProject(ws, data.projectId, data.userId);
                break;
            case 'leave_project':
                this.leaveProject(ws, data.projectId);
                break;
            case 'typing':
                this.broadcastTyping(ws, data.projectId, data.userId, data.isTyping);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    joinProject(ws, projectId, userId) {
        if (!this.clients.has(projectId)) {
            this.clients.set(projectId, new Set());
        }
        
        ws.projectId = projectId;
        ws.userId = userId;
        this.clients.get(projectId).add(ws);
        
        ws.send(JSON.stringify({
            type: 'joined_project',
            projectId: projectId
        }));
        
        console.log(`User ${userId} joined project ${projectId}`);
    }

    leaveProject(ws, projectId) {
        if (this.clients.has(projectId)) {
            this.clients.get(projectId).delete(ws);
            if (this.clients.get(projectId).size === 0) {
                this.clients.delete(projectId);
            }
        }
    }

    broadcastToProject(projectId, message) {
        if (this.clients.has(projectId)) {
            const projectClients = this.clients.get(projectId);
            const messageString = JSON.stringify(message);
            
            projectClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageString);
                }
            });
        }
    }

    broadcastTyping(ws, projectId, userId, isTyping) {
        if (this.clients.has(projectId)) {
            const projectClients = this.clients.get(projectId);
            const message = JSON.stringify({
                type: 'user_typing',
                userId: userId,
                isTyping: isTyping
            });
            
            projectClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(message);
                }
            });
        }
    }

    getActiveUsers(projectId) {
        if (!this.clients.has(projectId)) return [];
        
        return Array.from(this.clients.get(projectId))
            .filter(client => client.readyState === WebSocket.OPEN)
            .map(client => client.userId)
            .filter(userId => userId);
    }
}

module.exports = ChatWebSocketServer;