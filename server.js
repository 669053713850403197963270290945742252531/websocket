// server.js
const { WebSocketServer } = require("ws")
const wss = new WebSocketServer({ port: 8080 })

const clients = new Map() // userId -> ws

wss.on("connection", (ws) => {
    let myUserId = null

    ws.on("message", (data) => {
        const msg = JSON.parse(data)

        if (msg.type === "identify") {
            myUserId = msg.userId
            clients.set(myUserId, ws)

            // Tell all other connected clients about this new user
            for (const [uid, client] of clients) {
                if (uid !== myUserId && client.readyState === 1) {
                    client.send(JSON.stringify({
                        type = "user_joined",
                        userId = myUserId,
                        displayName = msg.displayName,
                        name = msg.name
                    }))
                }

                // Also tell the new user about everyone already connected
                if (uid !== myUserId) {
                    ws.send(JSON.stringify({
                        type = "user_joined",
                        userId = uid
                    }))
                }
            }
        }
    })

    ws.on("close", () => {
        if (myUserId) {
            clients.delete(myUserId)

            // Notify others this user disconnected
            for (const [uid, client] of clients) {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        type = "user_left",
                        userId = myUserId
                    }))
                }
            }
        }
    })
})