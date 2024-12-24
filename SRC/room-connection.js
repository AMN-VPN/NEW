// این بخش را جایگزین کد قبلی peer و connection کنید

let peer;
let connections = [];
let currentRoom = null;
function initializePeer(roomCode, isCreator) {
    console.log('Initializing peer connection', {roomCode, isCreator});
    
    peer.on('open', (id) => {
        console.log('Peer connection opened:', id);
        currentRoom = roomCode;
    });

    peer.on('connection', (conn) => {
        console.log('New peer connected:', conn.peer);
    });
function setupConnection(conn) {
    console.log('Setting up new connection:', conn.peer);
    connections.push(conn);
   
    // تنظیم رویدادهای اتصال
    conn.on('open', async () => {
        console.log('Connection opened with peer:', conn.peer);
        await sendExistingRecordings(conn);
    });

    // دریافت و پردازش داده‌های ورودی
    conn.on('data', async (data) => {
        console.log('Received data from:', conn.peer);
        if (data.type === 'audio') {
            const audioBlob = new Blob([data.audioData], { type: 'audio/webm' });
            
            // ذخیره در دیتابیس
            await db.voices.add({
                voiceId: data.voiceId,
                blob: audioBlob,
                timestamp: data.timestamp,
                roomCode: currentRoom,
                userEmail: data.userEmail
            });

            // نمایش فوری
            displayRecording(
                URL.createObjectURL(audioBlob),
                true,
                data.timestamp,
                data.voiceId,
                data.userEmail,
                data.userAvatar // دریافت و نمایش آواتار
            );
        }
    });
}
// همگام‌سازی پیام‌های موجود با کاربر جدید
async function syncExistingMessages(conn) {
    console.log('Starting message synchronization');
    const messages = await db.voices
        .where('roomCode')
        .equals(currentRoom)
        .toArray();
    console.log('Found messages to sync:', messages.length);
}}            voiceId: recording.voiceId,
            userEmail: currentUser.email
        });
    }
}
document.getElementById('createRoom').addEventListener('click', () => {
    const roomCode = generateRoomCode();
    initializePeer(roomCode, true);
    document.getElementById('roomCode').textContent = roomCode;
    document.getElementById('roomCodeDisplay').style.display = 'block';
});

document.getElementById('joinRoom').addEventListener('click', async () => {
    const roomCode = document.getElementById('joinRoomInput').value.trim();
    if (roomCode.length !== 6) {
        alert('لطفاً یک کد 6 رقمی معتبر وارد کنید');
        return;
    }

    initializePeer(roomCode, false);
});

// تغییر در تابع mediaRecorder.onstop
mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const timestamp = new Date().getTime();
    const voiceId = generateVoiceId();

    await db.voices.add({
        voiceId,
        blob: audioBlob,
        timestamp,
        roomCode: currentRoom,
        userEmail: currentUser.email
    });

    displayRecording(
        URL.createObjectURL(audioBlob),
        false,
        timestamp,
        voiceId,
        currentUser.email
    );

    if (connections.length > 0) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        connections.forEach(conn => {
            if (conn.open) {
                conn.send({
                    type: 'audio',
                    audioData: arrayBuffer,
                    timestamp,
                    voiceId,
                    userEmail: currentUser.email
                });
            }
        });
    }

    audioChunks = [];
};

function displayRecording(audioUrl, isRemote, timestamp, voiceId, userEmail) {
    const recordingItem = document.createElement('div');
    recordingItem.className = 'recording-item';
    recordingItem.setAttribute('data-voice-id', voiceId);
   
    const audio = document.createElement('audio');
    audio.src = audioUrl;
    audio.controls = true;
   
    const info = document.createElement('div');
    info.innerHTML = `
        <p>${isRemote ? 'دریافتی از: ' : 'ضبط شده توسط: '}${userEmail}</p>
        <small>${new Date(timestamp).toLocaleString('fa-IR')}</small>
    `;
   
    recordingItem.appendChild(audio);
    recordingItem.appendChild(info);
    document.getElementById('recordings').insertBefore(recordingItem, document.getElementById('recordings').firstChild);
}
