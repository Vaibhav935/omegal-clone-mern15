# WebRTC Application Modularization Guide

## Overview
Is guide me tumhare WebRTC application ko clean, maintainable aur modular structure me convert karne ka complete roadmap hai.

---

## Current Problems

### Frontend (App.jsx)
- 300+ lines ka ek hi file
- Socket logic, WebRTC logic, UI sab mixed
- State management scattered
- Reusability zero
- Testing mushkil

### Backend (server.js)
- Sab socket events ek hi file me
- No separation of concerns
- Scaling mushkil
- Code duplication

---

## Target Structure

### Frontend Structure (Simple Component Separation)
```
frontend/src/
├── components/
│   ├── ChatHeader.jsx
│   ├── ChatMessages.jsx
│   ├── ChatInput.jsx
│   ├── ChatSection.jsx
│   ├── LocalVideo.jsx
│   ├── RemoteVideo.jsx
│   └── VideoSection.jsx
├── App.jsx (clean - sirf components use karke)
└── main.jsx
```

**Note:** No custom hooks, no services, no utils. Sirf UI components alag files me.

### Backend Structure
```
backend/
├── config/
│   └── config.js
├── handlers/
│   ├── chatHandler.js
│   ├── webrtcHandler.js
│   └── connectionHandler.js
├── services/
│   └── socketService.js
├── utils/
│   └── logger.js
└── server.js (minimal - sirf setup)
```

---

## Step-by-Step Modularization Plan

### Phase 1: Backend Modularization

#### Step 1.1: Config File Banao
**File:** `backend/config/config.js`
```javascript
module.exports = {
  PORT: process.env.PORT || 9000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  CORS_METHODS: ["GET", "POST"]
}
```

#### Step 1.2: Chat Handler Separate Karo
**File:** `backend/handlers/chatHandler.js`
```javascript
// Chat related sab events yahan
const handleChatEvents = (socket, io) => {
  socket.on("sender", (senderData) => {
    // Chat logic
  })
}

module.exports = { handleChatEvents }
```

#### Step 1.3: WebRTC Handler Separate Karo
**File:** `backend/handlers/webrtcHandler.js`
```javascript
// WebRTC related sab events yahan
const handleWebRTCEvents = (socket, io) => {
  socket.on("offer", (data) => {
    // Offer logic
  })
  
  socket.on("answer", (data) => {
    // Answer logic
  })
  
  socket.on("ice-candidate", (data) => {
    // ICE candidate logic
  })
}

module.exports = { handleWebRTCEvents }
```

#### Step 1.4: Connection Handler
**File:** `backend/handlers/connectionHandler.js`
```javascript
const { handleChatEvents } = require('./chatHandler')
const { handleWebRTCEvents } = require('./webrtcHandler')

const handleConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    
    handleChatEvents(socket, io)
    handleWebRTCEvents(socket, io)
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}

module.exports = { handleConnection }
```

#### Step 1.5: Clean server.js
**File:** `backend/server.js`
```javascript
const express = require("express")
const http = require("http")
const { Server } = require('socket.io')
const config = require('./config/config')
const { handleConnection } = require('./handlers/connectionHandler')

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: config.CORS_METHODS
  }
})

handleConnection(io)

httpServer.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`)
})
```

---

### Phase 2: Frontend Modularization (Simple Component Separation)

**Important:** Sab logic App.jsx me hi rahega. Sirf UI ko components me separate karenge.

#### Step 2.1: ChatHeader Component
**File:** `frontend/src/components/ChatHeader.jsx`
```javascript
export const ChatHeader = ({ socketID }) => {
  return <div className="userHeader">{socketID}</div>
}
```

#### Step 2.2: ChatMessages Component
**File:** `frontend/src/components/ChatMessages.jsx`
```javascript
export const ChatMessages = ({ allMessage }) => {
  return (
    <div className="chatArea">
      {allMessage.map((msg, index) => (
        <div
          key={index}
          className={msg.isOwn ? "message own" : "message other"}
        >
          <div className="messageSender">
            {msg.isOwn ? "You" : msg.receiverData?.sender || "User"}
          </div>
          <div className="messageContent">
            {msg.message || msg.receiverData?.message}
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### Step 2.3: ChatInput Component
**File:** `frontend/src/components/ChatInput.jsx`
```javascript
export const ChatInput = ({ 
  targetId, 
  setTargetId, 
  message, 
  setMessage, 
  sendMessage,
  sendOffer 
}) => {
  return (
    <div className="inputArea">
      <input
        type="text"
        placeholder="Enter target ID"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
      />
      <div className="messageInputContainer">
        <input
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={sendOffer}>Send Offer</button>
      </div>
    </div>
  )
}
```

#### Step 2.4: ChatSection Component
**File:** `frontend/src/components/ChatSection.jsx`
```javascript
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

export const ChatSection = ({ 
  socketID, 
  allMessage, 
  targetId,
  setTargetId,
  message,
  setMessage,
  sendMessage,
  sendOffer
}) => {
  return (
    <div className="chatSection">
      <ChatHeader socketID={socketID} />
      <ChatMessages allMessage={allMessage} />
      <ChatInput
        targetId={targetId}
        setTargetId={setTargetId}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        sendOffer={sendOffer}
      />
    </div>
  )
}
```

#### Step 2.5: LocalVideo Component
**File:** `frontend/src/components/LocalVideo.jsx`
```javascript
export const LocalVideo = ({ localVideoRef }) => {
  return (
    <div className="localVideoContainer">
      <video ref={localVideoRef} autoPlay playsInline muted />
    </div>
  )
}
```

#### Step 2.6: RemoteVideo Component
**File:** `frontend/src/components/RemoteVideo.jsx`
```javascript
export const RemoteVideo = ({ remoteVideoRef }) => {
  return (
    <div className="remoteVideoContainer">
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  )
}
```

#### Step 2.7: VideoSection Component
**File:** `frontend/src/components/VideoSection.jsx`
```javascript
import { LocalVideo } from './LocalVideo'
import { RemoteVideo } from './RemoteVideo'

export const VideoSection = ({ localVideoRef, remoteVideoRef }) => {
  return (
    <div className="peerConnection">
      <div className="videoSection">
        <h3>Video Connection</h3>
        <div className="videoContainer">
          <LocalVideo localVideoRef={localVideoRef} />
          <RemoteVideo remoteVideoRef={remoteVideoRef} />
        </div>
      </div>
    </div>
  )
}
```

#### Step 2.8: Clean App.jsx

**Ab App.jsx aise dikhega:**

```javascript
import { useEffect, useRef, useState } from "react"
import "./App.css"
import { io } from "socket.io-client"
import { ChatSection } from "./components/ChatSection"
import { VideoSection } from "./components/VideoSection"

const socket = io("http://localhost:9000")

function App() {
  // States (sab wahi rahenge)
  const [socketID, setSocketID] = useState("")
  const [targetId, setTargetId] = useState("")
  const [message, setMessage] = useState("")
  const [allMessage, setAllMessage] = useState([])
  const [localVideoStream, setLocalVideoStream] = useState(null)
  const [remoteVideoStream, setRemoteVideoStream] = useState(null)

  // Refs (sab wahi rahenge)
  const pc = useRef(null)
  const remoteRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  // Functions (sab wahi rahenge - koi change nahi)
  const connectPC = () => {
    console.log("Creating peer connection...")
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
    })
    
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          targetId: remoteRef.current,
          candidate: event.candidate
        })
      }
    }
    
    pc.current.ontrack = (event) => {
      setRemoteVideoStream(event.streams[0])
      remoteVideoRef.current.srcObject = event.streams[0]
    }
  }

  const sendOffer = async () => {
    remoteRef.current = targetId
    let stream = localVideoStream
    
    if (!localVideoStream) {
      stream = await getCamera()
    }
    
    connectPC()
    stream.getTracks().forEach(track => pc.current.addTrack(track, stream))
    
    const offer = await pc.current.createOffer()
    await pc.current.setLocalDescription(offer)
    
    socket.emit("offer", {
      targetId: targetId,
      offer: offer,
    })
  }

  const sendMessage = () => {
    if (message.trim()) {
      setAllMessage((prev) => [
        ...prev,
        {
          targetId: targetId,
          message: message,
          isOwn: true,
        },
      ])
      socket.emit("sender", {
        targetId: targetId,
        message: message,
      })
      setMessage("")
    }
  }

  const getCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      localVideoRef.current.srcObject = stream
      setLocalVideoStream(stream)
      return stream
    } catch (error) {
      console.log("camera and video access denied", error)
      alert("video and audio required")
    }
  }

  // useEffect (sab wahi rahega - koi change nahi)
  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id)
    })

    socket.on("receiver", (receiverData) => {
      setAllMessage((prev) => [
        ...prev,
        {
          receiverData,
          isOwn: false,
        },
      ])
    })

    socket.on("offer", async (data) => {
      remoteRef.current = data.sender
      let stream = localVideoStream

      if (!localVideoStream) {
        stream = await getCamera()
      }

      connectPC()
      stream.getTracks().forEach(track => pc.current.addTrack(track, stream))

      await pc.current.setRemoteDescription(data.offer)
      const answer = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answer)

      socket.emit("answer", {
        answer: answer,
        targetId: data.sender,
      })
    })

    socket.on("ice-candidate", async (data) => {
      if (pc.current && data.candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (error) {
          console.error("Error adding ICE candidate:", error)
        }
      }
    })

    socket.on("answer", async (data) => {
      await pc.current.setRemoteDescription(data.answer)
    })
  }, [])

  // Return me sirf components use karo
  return (
    <div className="outer">
      <ChatSection
        socketID={socketID}
        allMessage={allMessage}
        targetId={targetId}
        setTargetId={setTargetId}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        sendOffer={sendOffer}
      />
      <VideoSection 
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />
    </div>
  )
}

export default App
```

**Key Points:**
- Sab logic App.jsx me hi hai (socket, WebRTC, state management)
- Sirf JSX/UI ko components me separate kiya hai
- No custom hooks, no services
- Simple aur straightforward approach

---

## Benefits of This Structure

### Frontend Benefits
1. **Clean Code**: App.jsx ab organized hai, UI alag hai
2. **Reusability**: Components ko reuse kar sakte ho
3. **Maintainability**: UI change karna easy - component me jao aur edit karo
4. **Readability**: Code samajhna easy hai
5. **Simple**: No complex hooks ya services, seedha approach

### Backend Benefits
1. **Separation of Concerns**: Har handler apna kaam karta hai
2. **Easy to Debug**: Problem kahan hai turant pata chal jayega
3. **Scalability**: Naye events add karna simple
4. **Testing**: Har handler ko independently test karo
5. **Configuration**: Environment variables easily manage karo

---

## Migration Strategy

### Simple Component Separation Approach (Recommended)

1. **Components folder banao**: `frontend/src/components/`
2. **Chat components banao** (ek ek karke):
   - ChatHeader.jsx
   - ChatMessages.jsx
   - ChatInput.jsx
   - ChatSection.jsx
3. **Video components banao**:
   - LocalVideo.jsx
   - RemoteVideo.jsx
   - VideoSection.jsx
4. **App.jsx update karo**: Components import karke use karo
5. **Test karo**: Sab kuch pehle jaisa kaam kar raha hai

**Important:** Sab logic App.jsx me hi rahega, sirf UI components alag honge.

---

## Testing Checklist

### Backend Testing
- [ ] Chat messages send/receive ho rahe hain
- [ ] Offer/Answer exchange ho raha hai
- [ ] ICE candidates exchange ho rahe hain
- [ ] Multiple clients connect kar sakte hain

### Frontend Testing
- [ ] Socket connection establish ho raha hai
- [ ] Camera access mil raha hai
- [ ] Video display ho raha hai
- [ ] Chat functionality kaam kar rahi hai
- [ ] WebRTC connection establish ho raha hai

---

## Common Pitfalls to Avoid

1. **Props Drilling**: Zyada nested components mat banao
2. **Import Paths**: Relative paths sahi se likho (`./` use karo)
3. **Missing Props**: Component ko sahi props pass karna mat bhoolna
4. **CSS Classes**: Existing CSS classes ko maintain karo (same names use karo)
5. **Over-Engineering**: Har choti cheez ke liye component mat banao

---

## Next Steps After Modularization

1. **Test Thoroughly**: Sab features kaam kar rahe hain check karo
2. **Add Comments**: Components me comments add karo
3. **Improve Styling**: Agar chahiye toh component-specific CSS banao
4. **Add Error Handling**: Try-catch blocks add karo
5. **Future**: Baad me custom hooks add kar sakte ho (optional)

---

## Conclusion

Yeh simple modularization approach tumhare code ko:
- **Organized** banayega
- **Clean** banayega  
- **Maintainable** banayega
- **Easy to understand** banayega

**Key Point:** Sab logic App.jsx me hi hai, sirf UI ko components me separate kiya hai. Yeh sabse simple aur straightforward approach hai - no custom hooks, no services, no complexity!

Ek baar yeh ho jaye toh baad me agar chahiye toh custom hooks aur services add kar sakte ho.


---

## Phase 3: Advanced Modularization with Custom Hooks (Optional)

**Note:** Yeh phase optional hai. Agar tumhe logic ko bhi App.jsx se separate karna hai aur code ko aur zyada modular banana hai, toh yeh approach follow karo.

### Why Custom Hooks?

**Problems with Current Approach (Phase 2):**
- App.jsx me abhi bhi 200+ lines hain
- Sab logic ek hi file me hai
- Testing mushkil hai
- Reusability limited hai

**Custom Hooks ke Benefits:**
- Logic ko separate kar sakte ho
- Reusable code
- Easy to test
- Clean App.jsx (50 lines se kam)

---

### Target Structure (Phase 3)

```
frontend/src/
├── components/
│   ├── ChatHeader.jsx
│   ├── ChatMessages.jsx
│   ├── ChatInput.jsx
│   ├── ChatSection.jsx
│   ├── LocalVideo.jsx
│   ├── RemoteVideo.jsx
│   └── VideoSection.jsx
├── hooks/
│   ├── useSocket.js
│   ├── useChat.js
│   ├── useCamera.js
│   └── useWebRTC.js
├── App.jsx (minimal - sirf hooks use karke)
└── main.jsx
```

---

### Step 3.1: useSocket Hook Banao

**File:** `frontend/src/hooks/useSocket.js`

```javascript
import { useState, useEffect } from "react"
import { io } from "socket.io-client"

// Socket instance - component ke bahar banao (singleton pattern)
let socketInstance = null

const getSocketInstance = () => {
  if (!socketInstance) {
    socketInstance = io("http://localhost:9000")
  }
  return socketInstance
}

export const useSocket = () => {
  const [socketID, setSocketID] = useState("")
  const socket = getSocketInstance()
  
  useEffect(() => {
    // Connect event listener
    const handleConnect = () => {
      console.log("Connected to server")
      console.log("My socket ID:", socket.id)
      setSocketID(socket.id)
    }
    
    socket.on("connect", handleConnect)
    
    // Cleanup function
    return () => {
      socket.off("connect", handleConnect)
    }
  }, [socket])
  
  return { socketID, socket }
}

export default useSocket
```

**Kya kiya:**
- Socket connection ko hook me wrap kiya
- Singleton pattern use kiya (ek hi socket instance)
- Socket ID state manage kar rahe hain
- Cleanup function add kiya (memory leak nahi hoga)
- Socket instance return kar rahe hain (baaki hooks use karenge)

**Key Concepts:**
- `socketInstance` - Global variable, ek baar hi create hoga
- `getSocketInstance()` - Agar socket nahi hai toh banao, warna existing return karo
- `useEffect` cleanup - Component unmount hone pe listener remove karo

---

### Step 3.2: useChat Hook Banao

**File:** `frontend/src/hooks/useChat.js`

```javascript
import { useState, useEffect } from "react"

export const useChat = (socket) => {
  const [targetId, setTargetId] = useState("")
  const [message, setMessage] = useState("")
  const [allMessage, setAllMessage] = useState([])
  
  useEffect(() => {
    // Agar socket nahi hai toh return karo
    if (!socket) return
    
    // Message receive karne ka handler
    const handleReceiveMessage = (receiverData) => {
      console.log("Message received:", receiverData)
      setAllMessage((prev) => [
        ...prev,
        {
          receiverData,
          isOwn: false,
        },
      ])
    }
    
    // Socket listener add karo
    socket.on("receiver", handleReceiveMessage)
    
    // Cleanup function
    return () => {
      socket.off("receiver", handleReceiveMessage)
    }
  }, [socket])
  
  // Message send karne ka function
  const sendMessage = () => {
    console.log("Sending message...")
    
    if (message.trim() && socket) {
      // Local state me add karo (instant feedback)
      setAllMessage((prev) => [
        ...prev,
        {
          targetId: targetId,
          message: message,
          isOwn: true,
        },
      ])
      
      // Server ko send karo
      socket.emit("sender", {
        targetId: targetId,
        message: message,
      })
      
      // Input field clear karo
      setMessage("")
    }
  }
  
  return {
    targetId,
    setTargetId,
    message,
    setMessage,
    allMessage,
    sendMessage
  }
}

export default useChat
```

**Kya kiya:**
- Chat related sab state ek jagah (targetId, message, allMessage)
- Message send/receive logic hook me
- Socket ko parameter me le rahe hain (dependency)
- Proper cleanup function
- Message clear karna after send

**Key Concepts:**
- `useEffect` dependency - Socket change hone pe re-run hoga
- Named handler functions - Cleanup me same function reference chahiye
- Optimistic UI update - Message turant dikhao, server response wait mat karo

---

### Step 3.3: useCamera Hook Banao

**File:** `frontend/src/hooks/useCamera.js`

```javascript
import { useState, useRef } from "react"

export const useCamera = () => {
  const [localVideoStream, setLocalVideoStream] = useState(null)
  const localVideoRef = useRef(null)
  
  // Camera access karne ka function
  const getCamera = async () => {
    // Agar stream already hai toh return karo
    if (localVideoStream) {
      console.log("Camera already active")
      return localVideoStream
    }
    
    try {
      console.log("Requesting camera access...")
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      console.log("Camera access granted")
      
      // Video element me stream set karo
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      // State update karo
      setLocalVideoStream(stream)
      
      return stream
    } catch (error) {
      console.error("Camera access denied:", error)
      alert("Video and audio access required for this app")
      throw error
    }
  }
  
  // Camera band karne ka function
  const stopCamera = () => {
    if (localVideoStream) {
      console.log("Stopping camera...")
      
      // Sab tracks stop karo (video + audio)
      localVideoStream.getTracks().forEach(track => {
        track.stop()
        console.log(`Stopped track: ${track.kind}`)
      })
      
      // State clear karo
      setLocalVideoStream(null)
      
      // Video element clear karo
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
    }
  }
  
  return { 
    localVideoStream, 
    localVideoRef, 
    getCamera, 
    stopCamera 
  }
}

export default useCamera
```

**Kya kiya:**
- Camera access logic separate kiya
- Video stream state manage kar rahe hain
- Start/stop camera functions
- Error handling with user-friendly message
- Duplicate camera access prevent kiya

**Key Concepts:**
- `useRef` for video element - DOM reference store karne ke liye
- `getUserMedia` - Browser API for camera/mic access
- `getTracks()` - Stream me multiple tracks hote hain (video, audio)
- Cleanup - Camera band karna important hai (battery save)

---

### Step 3.4: useWebRTC Hook Banao

**File:** `frontend/src/hooks/useWebRTC.js`

```javascript
import { useRef, useEffect } from "react"

export const useWebRTC = (socket, localVideoStream, getCamera) => {
  const pc = useRef(null)
  const remoteRef = useRef(null)
  const remoteVideoRef = useRef(null)
  
  // Peer connection setup karne ka function
  const connectPC = () => {
    console.log("Creating peer connection...")
    
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
    })
    
    console.log("Peer connection created")
    
    // ICE candidate generate hone par
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate generated")
        socket.emit("ice-candidate", {
          targetId: remoteRef.current,
          candidate: event.candidate
        })
        console.log("ICE candidate sent to:", remoteRef.current)
      } else {
        console.log("All ICE candidates have been sent")
      }
    }
    
    // Remote track receive hone par
    pc.current.ontrack = (event) => {
      console.log("Remote track received")
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
        console.log("Remote video stream set")
      }
    }
    
    // Connection state changes
    pc.current.onconnectionstatechange = () => {
      console.log("Connection state:", pc.current.connectionState)
    }
  }
  
  // Offer send karne ka function
  const sendOffer = async (targetId) => {
    console.log("Sending offer to:", targetId)
    remoteRef.current = targetId
    
    // Camera stream get karo
    let stream = localVideoStream
    if (!localVideoStream) {
      console.log("Camera not active, requesting access...")
      stream = await getCamera()
    }
    
    // Peer connection setup karo
    connectPC()
    
    // Local tracks add karo peer connection me
    stream.getTracks().forEach(track => {
      pc.current.addTrack(track, stream)
      console.log(`Added ${track.kind} track to peer connection`)
    })
    
    // Offer create karo
    const offer = await pc.current.createOffer()
    console.log("Offer created")
    
    // Local description set karo
    await pc.current.setLocalDescription(offer)
    console.log("Local description set")
    
    // Server ko offer send karo
    socket.emit("offer", {
      targetId: targetId,
      offer: offer,
    })
    console.log("Offer sent to server")
  }
  
  // Socket event listeners
  useEffect(() => {
    if (!socket) return
    
    // Offer receive karne ka handler
    const handleOffer = async (data) => {
      console.log("Offer received from:", data.sender)
      remoteRef.current = data.sender
      
      // Camera stream get karo
      let stream = localVideoStream
      if (!localVideoStream) {
        console.log("Camera not active, requesting access...")
        stream = await getCamera()
      }
      
      // Peer connection setup karo
      connectPC()
      
      // Local tracks add karo
      stream.getTracks().forEach(track => {
        pc.current.addTrack(track, stream)
        console.log(`Added ${track.kind} track to peer connection`)
      })
      
      // Remote description set karo
      await pc.current.setRemoteDescription(data.offer)
      console.log("Remote description set")
      
      // Answer create karo
      const answer = await pc.current.createAnswer()
      console.log("Answer created")
      
      // Local description set karo
      await pc.current.setLocalDescription(answer)
      console.log("Local description set")
      
      // Server ko answer send karo
      socket.emit("answer", {
        answer: answer,
        targetId: data.sender,
      })
      console.log("Answer sent to:", data.sender)
    }
    
    // Answer receive karne ka handler
    const handleAnswer = async (data) => {
      console.log("Answer received from:", data.sender)
      
      // Remote description set karo
      await pc.current.setRemoteDescription(data.answer)
      console.log("Connection established!")
    }
    
    // ICE candidate receive karne ka handler
    const handleIceCandidate = async (data) => {
      console.log("ICE candidate received from:", data.sender)
      
      if (pc.current && data.candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate))
          console.log("ICE candidate added successfully")
        } catch (error) {
          console.error("Error adding ICE candidate:", error)
        }
      } else {
        console.log("Peer connection not ready or candidate is null")
      }
    }
    
    // Socket listeners add karo
    socket.on("offer", handleOffer)
    socket.on("answer", handleAnswer)
    socket.on("ice-candidate", handleIceCandidate)
    
    // Cleanup function
    return () => {
      socket.off("offer", handleOffer)
      socket.off("answer", handleAnswer)
      socket.off("ice-candidate", handleIceCandidate)
    }
  }, [socket, localVideoStream, getCamera])
  
  return { 
    remoteVideoRef, 
    sendOffer 
  }
}

export default useWebRTC
```

**Kya kiya:**
- WebRTC peer connection logic separate kiya
- Offer/Answer/ICE candidate handling
- Socket events ko hook me manage kar rahe hain
- Detailed logging for debugging
- Connection state monitoring

**Key Concepts:**
- `RTCPeerConnection` - WebRTC ka main API
- `onicecandidate` - NAT traversal ke liye ICE candidates
- `ontrack` - Remote video/audio receive karne ke liye
- `addTrack` - Local video/audio send karne ke liye
- SDP (Session Description Protocol) - Offer/Answer format

---

### Step 3.5: Updated App.jsx (With Custom Hooks)

**File:** `frontend/src/App.jsx`

```javascript
import "./App.css"
import { ChatSection } from "./components/ChatSection"
import { VideoSection } from "./components/VideoSection"
import useSocket from "./hooks/useSocket"
import useChat from "./hooks/useChat"
import useCamera from "./hooks/useCamera"
import useWebRTC from "./hooks/useWebRTC"

function App() {
  // Custom hooks use karo - sab logic hooks me hai
  const { socketID, socket } = useSocket()
  
  const { 
    targetId, 
    setTargetId, 
    message, 
    setMessage, 
    allMessage, 
    sendMessage 
  } = useChat(socket)
  
  const { 
    localVideoStream, 
    localVideoRef, 
    getCamera 
  } = useCamera()
  
  const { 
    remoteVideoRef, 
    sendOffer 
  } = useWebRTC(socket, localVideoStream, getCamera)
  
  // Offer send karne ka wrapper function
  const handleSendOffer = () => {
    if (targetId) {
      sendOffer(targetId)
    } else {
      alert("Please enter target ID first")
    }
  }
  
  return (
    <div className="outer">
      <ChatSection
        socketID={socketID}
        allMessage={allMessage}
        targetId={targetId}
        setTargetId={setTargetId}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        sendOffer={handleSendOffer}
      />
      <VideoSection 
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />
    </div>
  )
}

export default App
```

**Kya hua:**
- App.jsx ab sirf 50 lines ka hai! 🎉
- Sab logic custom hooks me chala gaya
- Clean aur readable code
- Easy to test aur maintain
- No useEffect, no refs, no complex logic

---

## Phase 3 Benefits

### Code Organization:
```
Before (Phase 2): App.jsx = 250 lines
After (Phase 3):  App.jsx = 50 lines
                  useSocket = 30 lines
                  useChat = 50 lines
                  useCamera = 40 lines
                  useWebRTC = 120 lines
```

### Benefits:

1. **Separation of Concerns**
   - Har hook apna specific kaam karta hai
   - Socket logic alag, Chat logic alag, WebRTC logic alag

2. **Reusability**
   - Hooks ko doosri jagah bhi use kar sakte ho
   - Example: useSocket ko admin panel me bhi use karo

3. **Testing**
   - Har hook ko independently test kar sakte ho
   - Mock data easily pass kar sakte ho

4. **Maintainability**
   - Bug fix karna easy - ek hook me jao aur fix karo
   - Code review easy hai

5. **Readability**
   - App.jsx ab bahut clean hai
   - Naye developer ko samajhna easy

---

## When to Use Phase 3?

### ✅ Use karo jab:
- Project bada ho raha hai (10+ components)
- Multiple developers kaam kar rahe hain
- Testing important hai
- Code reusability chahiye
- Long-term maintenance plan hai

### ❌ Mat use karo jab:
- Simple/small project hai (5 components se kam)
- Sirf tum akele kaam kar rahe ho
- Quick prototype banana hai
- Deadline tight hai
- Over-engineering se bachna hai

---

## Migration Path: Phase 2 → Phase 3

### Step-by-Step Migration:

**Step 1:** Pehle Phase 2 complete karo (components separate karo)

**Step 2:** useSocket hook banao aur test karo
```bash
# Test karo
console.log(socketID) // Socket ID dikhai dena chahiye
```

**Step 3:** useChat hook banao aur test karo
```bash
# Message send/receive test karo
```

**Step 4:** useCamera hook banao aur test karo
```bash
# Camera access test karo
```

**Step 5:** useWebRTC hook banao aur test karo
```bash
# Video call test karo
```

**Step 6:** App.jsx update karo - sab hooks use karo

**Step 7:** Full testing karo - sab features kaam kar rahe hain

---

## Comparison: Phase 2 vs Phase 3

### Phase 2 (Simple Component Separation)
```
✅ Sirf UI components separate
✅ Logic App.jsx me
✅ Quick to implement (2-3 hours)
✅ Easy to understand
✅ Good for small projects
❌ App.jsx thoda bada rahega (200+ lines)
❌ Testing mushkil
❌ Reusability limited
```

### Phase 3 (Custom Hooks)
```
✅ Logic bhi separate
✅ App.jsx bahut clean (50 lines)
✅ Highly maintainable
✅ Reusable hooks
✅ Easy to test
✅ Professional code structure
❌ Thoda complex (learning curve)
❌ More files to manage (4 extra hooks)
❌ Takes more time (5-6 hours)
```

---

## Best Practices for Custom Hooks

### 1. Naming Convention
```javascript
// ✅ Good
useSocket()
useChat()
useWebRTC()

// ❌ Bad
socketHook()
chatLogic()
webrtc()
```

### 2. Single Responsibility
```javascript
// ✅ Good - Ek hook ek kaam
useSocket() // Sirf socket connection
useChat()   // Sirf chat logic

// ❌ Bad - Ek hook sab kuch
useSocketAndChatAndVideo() // Too much!
```

### 3. Return Values
```javascript
// ✅ Good - Object return karo (order matter nahi karta)
return { socketID, socket }

// ❌ Bad - Array return (order important hai)
return [socketID, socket]
```

### 4. Dependencies
```javascript
// ✅ Good - Sab dependencies mention karo
useEffect(() => {
  // code
}, [socket, localVideoStream, getCamera])

// ❌ Bad - Dependencies missing
useEffect(() => {
  // code
}, []) // Warning aayega
```

### 5. Cleanup
```javascript
// ✅ Good - Cleanup function add karo
useEffect(() => {
  socket.on("event", handler)
  return () => {
    socket.off("event", handler)
  }
}, [])

// ❌ Bad - No cleanup (memory leak)
useEffect(() => {
  socket.on("event", handler)
}, [])
```

---

## Debugging Tips

### Problem 1: Hook not working
```javascript
// Check karo:
1. Hook properly import kiya hai?
2. Hook component ke andar call kiya hai?
3. Dependencies sahi hain?
```

### Problem 2: Infinite re-renders
```javascript
// Reason: useEffect dependencies galat hain
// Solution: Dependencies array check karo
useEffect(() => {
  // code
}, [dependency1, dependency2]) // Yeh sahi hone chahiye
```

### Problem 3: State not updating
```javascript
// Reason: Async state update
// Solution: Callback function use karo
setAllMessage((prev) => [...prev, newMessage]) // ✅ Good
setAllMessage([...allMessage, newMessage])     // ❌ Bad
```

---

## Final Recommendation

**For Beginners:**
1. Start with Phase 2 (Simple Components)
2. Get comfortable with component structure
3. Then move to Phase 3 (Custom Hooks)

**For Experienced Developers:**
1. Directly implement Phase 3
2. Add TypeScript for type safety
3. Add unit tests for hooks

**For Production Apps:**
1. Phase 3 is recommended
2. Add error boundaries
3. Add logging and monitoring
4. Add performance optimization

---

## Conclusion

Phase 3 (Custom Hooks) tumhare code ko:
- **Professional** banayega
- **Scalable** banayega
- **Testable** banayega
- **Maintainable** banayega

Lekin yaad rakho: **Over-engineering se bacho!** Agar project chhota hai toh Phase 2 hi kaafi hai.

**Golden Rule:** Start simple (Phase 2), scale when needed (Phase 3).

Happy Coding! 🚀
