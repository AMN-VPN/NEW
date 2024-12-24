// Load recordings with precise room filtering
// بارگذاری و نمایش پیام‌های صوتی اتاق
async function loadRoomContent() {
    console.log('Loading room content for:', currentRoom);
    const recordings = await db.voices
        .where('roomCode')
        .equals(currentRoom)
        .toArray();
    console.log('Loaded recordings:', recordings.length);
    
    recordings.forEach(recording => {
        console.log('Processing recording:', recording.voiceId);
    });
}
// مدیریت تغییر اتاق و بروزرسانی وضعیت
function changeRoomState(newRoomCode) {
    console.log('Room state change requested:', newRoomCode);
    currentRoom = newRoomCode;
    document.getElementById('currentRoomDisplay').textContent = `اتاق فعلی: ${newRoomCode}`;
    console.log('Room state updated successfully');
}

// بررسی و مدیریت اتصالات فعال در اتاق
function monitorRoomConnections() {
    console.log('Monitoring room connections');
    connections.forEach((conn, index) => {
        console.log(`Connection ${index} status:`, conn.open ? 'active' : 'inactive');
    });
    console.log('Total active connections:', connections.filter(c => c.open).length);
}
class RoomManager {
    constructor() {
        console.log('Room Manager initialized');
        this.connections = new Map();
    }

    createRoom() {
        const roomCode = this.generateRoomCode();
        console.log(`Creating new room with code: ${roomCode}`);
        // کد موجود
    }

    joinRoom(roomCode) {
        console.log(`Attempting to join room: ${roomCode}`);
        currentRoom = roomCode;
        localStorage.setItem('currentRoomCode', roomCode);
        initializePeer(roomCode, false);
    }

    // Room management function
    changeRoom(newRoomCode) {
        console.log('Changing room to:', newRoomCode);
        currentRoom = newRoomCode;
        loadExistingRecordings();
        console.log('Room change complete');
    }

    // Generate unique room code
    generateRoomCode() {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated room code:', code);
        return code;
    }
}

// تابع initialize برای راه‌اندازی اولیه
function initializePeer(roomCode, isCreator = false) {
    const peerId = isCreator ? roomCode : `${roomCode}-${Math.random().toString(36).substr(2, 4)}`;
    
    peer = new Peer(peerId, {
        config: { iceServers: CONFIG.STUN_SERVERS }
    });

    peer.on('open', (id) => {
        if (!isCreator) {
            const conn = peer.connect(roomCode);
            setupConnection(conn);
        }
    });

    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
}

async function loadExistingRecordings() {
    console.log('Loading recordings for current room');
    document.getElementById('recordings').innerHTML = '';
   
    const recordings = await db.voices
        .where('roomCode')
        .equals(currentRoom)
        .toArray();
    console.log(`Found ${recordings.length} recordings in database`);    recordings
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(recording => {
            console.log('Processing recording:', recording.voiceId);
            displayRecording(
                URL.createObjectURL(recording.blob),
                recording.userEmail !== currentUser.email,
                recording.timestamp,
                recording.voiceId,
                recording.userEmail
            );
        });
}

function initializeRoomControls() {
    console.log('Initializing room controls');
    
    // کد قبلی برای ایجاد اتاق
    document.getElementById('createRoom').onclick = () => {
        const roomCode = generateRoomCode();
        localStorage.setItem('currentRoomCode', roomCode);
        document.getElementById('roomCode').textContent = roomCode;
        document.getElementById('roomCodeDisplay').style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'chat-room.html';
        }, 3000);
    };
      // اضافه کردن عملکرد پیوستن به اتاق
      document.getElementById('joinRoom').onclick = () => {
          const roomCode = document.getElementById('joinRoomInput').value.trim();
        
          if (roomCode.length !== 6) {
              alert('لطفاً یک کد 6 رقمی معتبر وارد کنید');
              return;
          }
        
          localStorage.setItem('currentRoomCode', roomCode);
          alert('در حال پیوستن به اتاق...');
        
          setTimeout(() => {
              window.location.href = 'chat-room.html';
          }, 1000);
      };
  }

  function setupConnection(conn) {
      connections.push(conn);
    
      conn.on('open', async () => {
          const voices = await db.voices
              .where('roomCode')
              .equals(currentRoom)
              .toArray();
        
          for (let voice of voices) {
              const arrayBuffer = await voice.blob.arrayBuffer();
              conn.send({
                  type: 'audio',
                  audioData: arrayBuffer,
                  timestamp: voice.timestamp,
                  voiceId: voice.voiceId,
                  userEmail: voice.userEmail
              });
          }
      });
  }
function initializePeer(roomCode, isCreator) {
    const peerId = isCreator ? roomCode : `${roomCode}-${Date.now()}`;
    
    peer = new Peer(peerId, {
        config: { iceServers: CONFIG.STUN_SERVERS }
    });

    peer.on('open', id => {
        console.log('My peer ID is: ' + id);
        if (!isCreator) {
            connectToPeer(roomCode);
        }
    });

    peer.on('connection', conn => {
        handleConnection(conn);
    });
}

const CONFIG = {
    STUN_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.stunprotocol.org:3478' }
    ]
};
