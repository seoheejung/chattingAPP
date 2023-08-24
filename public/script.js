const socket = io();

const userName = document.getElementById('userName')
const userIcon = document.getElementById('userIcon')
const roomInput = document.getElementById('room');
const messages = document.getElementById('messages');
const form = document.querySelector('form');
const input = document.getElementById('message');

let userPokemonName; // 포켓몬 이름
let userPokemonID; // 포켓몬 번호
let userImageUrl; // 현재 이미지 url
let currentRoom;  // 현재 방을 저장할 변수

// 관동지방 포켓몬 151마리 랜덤 번호
const getRandomInt = () => Math.floor(Math.random() * 151) + 1;

// 랜덤한 포켓몬 이름 생성 및 적용
const generateRandomName = async () => {
    const randomId = getRandomInt(); // 랜덤 ID 생성
    const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
            query pokemon {
                pokemon_v2_pokemon: pokemon_v2_pokemonspecies(where: {pokemon_v2_generation: {name: {_eq: "generation-i"}}, id: {_eq:${randomId}}}) {
                    name
                    id
                    pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 3}}) {
                    name
                    language_id
                    }
                }
            }
            `,
        }),
    });
    const responseBody = await response.json();
    const pokemonName = responseBody.data.pokemon_v2_pokemon[0].pokemon_v2_pokemonspeciesnames[0].name;
    userPokemonID = responseBody.data.pokemon_v2_pokemon[0].id;
    userImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${userPokemonID}.gif`;
    return pokemonName;
}

const applyUsername = async () => {
    userPokemonName = await generateRandomName();

    // 사용자 이름을 서버로 전송
    sendUsernameToServer();
    
    // 화면에 사용자 이름과 아이콘 표시
    userName.innerText = userPokemonName;
    userIcon.src = userImageUrl;
}

// 현재 사용자 이름을 서버에 전송하는 함수 
const  sendUsernameToServer = () => {
    socket.emit('username', userPokemonName);
}

applyUsername();

// 소켓 재연결 시 사용자 이름을 서버로 다시 전송
socket.on('reconnect', sendUsernameToServer);

let roomMessages = {};

roomInput.addEventListener('change', () => {
    if (roomInput.value) { // 룸 이름이 제대로 선택되었다면
        // 현재 화면에 보여주고 있는 메시지들 저장
        if (currentRoom) {
            roomMessages[currentRoom] = messages.innerHTML;
        }
        
        // 선택된 룸으로 변경
        currentRoom = roomInput.value;
        
        // 만약 이전에 들어왔던 룸이라면, 그 때의 메시지들 로드
        if (roomMessages[currentRoom]) {
            messages.innerHTML = roomMessages[currentRoom];
        } else {  // 처음 들어가는 룸이라면, 화면 초기화
            messages.innerHTML = '';

            // 클라이언트가 특정 채팅방에 참여하겠다고 서버에 알리는 것
            socket.emit('join room', 
            {
                name: userPokemonName,
                room: currentRoom,
            });

            // 특정 사용자가 채팅방에 참여했다는 사실을 다른 클라이언트들에게 알리기 위해 서버를 통해 보내지는 메시지
            socket.emit('user joined', 
            {
                name: userPokemonName,
                room: currentRoom,
            });

            document.getElementById('chatUI').style.display = 'block';  // 채팅 UI 보여주기
        }
    } 
});

// 새로운 사용자가 채팅방에 입장했을 때 시스템 메세지 도착
socket.on('new message', (data) => {
    const newMessage = document.createElement("div");
    
    if (data.name === "System") {
        newMessage.innerHTML = `<p>${data.message}</p>`;
        newMessage.style.color = "red";  // 시스템 메시지인 경우 텍스트 색상 변경
    } else {
        newMessage.innerHTML = `${data.name}: ${data.message}`;
    }

    newMessage.classList.add("new-message"); 
    messages.appendChild(newMessage);
});

// 채팅 요청이 있을 때
socket.on("chat message", ({ name, msg, img }) => {
    const item = document.createElement('li');
    item.classList.add('message-item');

    const messageName = document.createElement('div');
    messageName.classList.add('message-name');

    // 이미지 요소 생성
    const userImage = document.createElement('img');
    userImage.src = img;
    userImage.classList.add('user-image'); // 클래스 추가
    const userNameText = document.createTextNode(name); // 이름을 나타내는 텍스트 노드 생성
    messageName.appendChild(userImage); // 이름 요소에 이미지 추가
    messageName.appendChild(userNameText); // 이름 요소에 텍스트 추가 (이미지 뒤)

    item.appendChild(messageName);

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = msg;

    // 현재 시간 요소 생성
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');

    // 현재 시간 가져오기
    const now = new Date();
    // 현재 시간을 HH:MM:SS 포맷으로 변환하기 (24시간제)
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    messageTime.textContent = timeString;

    // 받는 메세지, 보내는 메세지 구분
    if (name === userPokemonName) {
        item.classList.add('message-sent');
    } else {
        item.classList.add('message-received');
    }
    item.appendChild(messageText);
    item.appendChild(messageTime);

    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    socket.emit('chat message', {
        name: userPokemonName,
        msg: input.value,
        img: userImageUrl,
    });

    input.value = '';
});


