import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors"
import { initSocket } from "./socket.js";
import internalRoutes from "./routes/internal.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/internal", internalRoutes);
const server = http.createServer(app);
initSocket(server);

const port = Number(process.env.PORT);

server.listen(port,()=>{
    console.log(`Realtime service is running on port ${port}`);
})