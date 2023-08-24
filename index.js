const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = 8080;

// Socket.IO 서버 인스턴스 생성
const io = require('socket.io')(server, {
    // 서버가 클라이언트에게 "ping" 메시지를 보내는 간격
    pingTimeout: 30000, // 30초
    // 서버가 "pong" 응답을 기다리는 시간
    pingInterval: 15000, // 15초
});

// 사용자 이름과 방 이름을 저장하는 Map 관리하는 socketEvents 모듈
const socketEvents = require('./socketHandlers/socketEvents')(io);

app.use(express.static('public'));

server.listen(port, () => {
    console.log(`server : http://localhost:${port}`);
});