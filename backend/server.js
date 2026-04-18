const express = require("express");
const http = require("http");
const config = require("./config/config");
const { Server } = require("socket.io");
const { connectionHandler } = require("./handlers/connectionHandler");
const app = express();
const authRouter = require("./src/router/auth.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectToDB = require("./config/db");

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173/",
  },
});

connectToDB();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

connectionHandler(io);

// io.on('connection', (socket) => {
//   console.log('a clint connected',socket.id);

//   socket.on("sender",(senderData)=>{
//         const{targetId,message}=senderData
//         console.log(targetId ,message)
//         io.to(targetId).emit("receiver",{
//             sender:socket.id,
//             message:message
//         })

//   })

//   // Offer ko ek client se dusre client tak forward karna
//   // Client A offer bhejta hai, hum use Client B tak forward karte hain
//   socket.on("offer",(data)=>{
//     console.log("Offer received from:",socket.id,"forwarding to:",data.targetId)
//     // Target client ko offer forward karo with sender info
//     io.to(data.targetId).emit("offer",{
//         offer:data.offer,
//         sender:socket.id  // Kis ne bheja ye batane ke liye
//     })
//   })

//   // Answer ko ek client se dusre client tak forward karna
//   // Client B answer bhejta hai, hum use Client A tak forward karte hain
//   socket.on("answer",(data)=>{
//     console.log("Answer received from:",socket.id,"forwarding to:",data.targetId)
//     // Target client ko answer forward karo with sender info
//     io.to(data.targetId).emit("answer",{
//         answer:data.answer,
//         sender:socket.id  // Kis ne bheja ye batane ke liye
//     })
//   })

//   // ICE candidate ko ek client se dusre client tak forward karna
//   // Jab ek client apna ICE candidate bhejta hai, hum use target client tak forward karte hain
//   socket.on("ice-candidate",(data)=>{
//     console.log("ICE candidate received from:",socket.id,"forwarding to:",data.targetId)
//     // Target client ko ICE candidate forward karo with sender info
//     io.to(data.targetId).emit("ice-candidate",{
//         candidate:data.candidate,
//         sender:socket.id  // Kis ne bheja ye batane ke liye
//     })
//   })

// });

httpServer.listen(config.PORT, () => {
  console.log("server started ", config.PORT);
});

// test changes
