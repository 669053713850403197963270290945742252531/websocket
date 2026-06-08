const { WebSocketServer } = require("ws")
const wss = new WebSocketServer({ port: 8080 })

const clients = new Map()

wss.on("connection", (ws) => {
    let myUserId = null

    ws.on("message", (data) => {
        let msg
        try {
            msg = JSON.parse(data)
        } catch (e) {
            return
        }

        if (msg.type === "identify") {
            myUserId = msg.userId
            clients.set(myUserId, { ws, displayName: msg.displayName, name: msg.name })

            console.log(`[+] ${msg.displayName} (@${msg.name}) connected | userId: ${myUserId}`)
            console.log(`[=] Total connected: ${clients.size}`)

            // Tell all other connected clients about this new user
            for (const [uid, data] of clients) {
                if (uid !== myUserId && data.ws.readyState === 1) {
                    data.ws.send(JSON.stringify({
                        type: "user_joined",
                        userId: myUserId,
                        displayName: msg.displayName,
                        name: msg.name
                    }))
                }

                // Tell the new user about everyone already connected
                if (uid !== myUserId) {
                    ws.send(JSON.stringify({
                        type: "user_joined",
                        userId: uid,
                        displayName: data.displayName,
                        name: data.name
                    }))
                }
            }
        }
    })

    ws.on("close", () => {
        if (myUserId) {
            const data = clients.get(myUserId)
            console.log(`[-] ${data?.displayName} (@${data?.name}) disconnected`)
            clients.delete(myUserId)

            for (const [uid, clientData] of clients) {
                if (clientData.ws.readyState === 1) {
                    clientData.ws.send(JSON.stringify({
                        type: "user_left",
                        userId: myUserId
                    }))
                }
            }

            console.log(`[=] Total connected: ${clients.size}`)
        }
    })

    ws.on("error", (err) => {
        console.error(`[!] Socket error: ${err.message}`)
    })
})

console.log("[*] WebSocket server running on ws://localhost:8080")