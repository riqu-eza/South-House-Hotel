import { Server } from "socket.io";

const io = new Server( {
  cors: {
    origin: ["http://localhost:5173",'https://southhousehotel.com/'] // Replace with your frontend URL
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

export { io };
