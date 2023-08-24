# 💬 포켓몬 랜덤 채팅 앱

## 🚀 기획의도
* NodeJS와 Socket.io를 활용하여 실시간 통신 기능을 구현하기 위한 연습용 프로젝트
* 포켓몬 API (pokeAPI)가 graphQL 베타 버전을 지원하기 때문에 API를 활용하여 포켓몬 정보를 사용하는 서비스를 개발

## 📌 프로젝트 기본 정보
* FrontEnd : HTML, CSS, JavaScript
* BackEnd : NodeJS express, socket.io

## 📌 프로젝트 기본 구조
```js
chattingAPP
├── socketHandlers
│   └── socketEvents.js
├── public
│   ├── index.html
│   ├── script.js
│   └── styles.css
└── index.js
```

## 💡 주요 기능
* 랜덤 포켓몬 설정
* 채팅방 입장
* 채팅방 입장 시 해당 채팅방 접속 인원 모두에게 상태 알림
* 채팅

## 💭 이후 필요 작업
* 채팅 내용 DB에 추가
* 임시 서비스 오픈