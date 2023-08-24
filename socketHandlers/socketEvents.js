
// 사용자 이름과 방 이름을 저장하는 Map 생성
const userRoomMap = new Map()

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('채팅방 서버가 열렸습니다.')
    
        // 사용자 이름을 받는 이벤트 핸들러
        socket.on('username', (name) => {
            console.log(`${name}님이 접속했습니다.`)
        })
    
        // 사용자가 채팅방에 입장할 때
        socket.on('join room', ({name, room}) => {
            const prevRoom = userRoomMap.get(socket.id) // 이전에 접속했던 방 이름 가져오기
    
            if (prevRoom && prevRoom !== room) {
                socket.leave(prevRoom) // 이전 방에서 나가기
            }
    
            // 새로운 방에 입장하고 Map 업데이트
            socket.join(room)
            userRoomMap.set(socket.id, room)
            console.log(`사용자 ${name}님이 ${room}방에 입장했습니다.`)
        })

        // 다른 사용자가 현재 채팅방에 참여했다는 사실을 다른 클라이언트들에게 알릴 때
        socket.on('user joined', (data) => {
            io.to(data.room).emit('new message', {
                name: "System",  // 시스템 메시지
                message: `${data.name}님이 입장했습니다.`,
            });
        });
    
        // 사용자가 채팅 메시지를 보냈을 때의 이벤트 
        socket.on('chat message', ({ name, msg, img }) => {
            const room = userRoomMap.get(socket.id) // 현재 사용자의 방 이름 가져오기
    
            if (room) {
                io.to(room).emit('chat message', {
                    name,
                    msg,
                    img,
                })
            }
        })
    
        // 사용자가 접속을 종료했을 때의 이벤트
        socket.on('disconnect', () => {
            userRoomMap.delete(socket.id) // 사용자 Map에서 제거
            console.log(`접속을 종료했습니다.`)
        })
    })
}
