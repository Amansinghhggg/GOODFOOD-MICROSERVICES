import { Server } from "socket.io";
import http from "node:http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.use((socket, next) => {
    try{
    const token = socket.handshake.auth.token;
    if(!token){
        return next(new Error("Unauthorized"));
    }
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string )as any
            socket.data.user = decoded.user
    if(!decoded) {
        return next(new Error("Authentication error"));
    }
    next();
    }catch(err){
        console.log("❌ Socket authentication error:", err);
        next(new Error("Unauthorized"));
    }
})
    io.on("connection", (socket) => {
        const user = socket.data.user;
        if(!user){
            socket.disconnect();
            return;
        }
        const userId = user._id;
        socket.join(`user:${userId}`);
        if(user.restaurantId){
            socket.join(`restaurant:${user.restaurantId}`);
        }
        console.log(`✅ User connected: ${user.name} (ID: ${user.id})`);

        // allow client to request joining additional rooms when needed
        socket.on('join_room', (room, cb) => {
            try{
                if (typeof room === 'string' && room.length > 0) {
                    socket.join(room);
                    console.log(`Socket ${socket.id} joined room ${room} on client request`);
                    if (typeof cb === 'function') cb({ ok: true });
                } else {
                    if (typeof cb === 'function') cb({ ok: false, error: 'invalid_room' });
                }
            }catch(err){
                console.error('Error joining room from client request', err);
                if (typeof cb === 'function') cb({ ok: false, error: 'exception' });
            }
        });
        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${user.name} (ID: ${user.id})`);
        });
    });
    return io;
};

export const getIO = () => {
    if(!io){
        throw new Error("Socket.io not initialized");
    }
    return io;
};
