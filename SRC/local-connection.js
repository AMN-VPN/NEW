let peer;
let connections = [];
let currentRoom = null;

function initializePeer(roomCode, isCreator) {
    const peerId = isCreator ? roomCode : `${roomCode}-${Math.random().toString(36).substr(2, 4)}`;
    
    peer = new Peer(peerId, {
        config: { iceServers: CONFIG.STUN_SERVERS },
        debug: 2
    });

    peer.on('open', (id) => {
        if (!isCreator) {
            const conn = peer.connect(roomCode); // اتصال به creator
            conn.on('open', () => {
                setupConnection(conn);
                console.log('Connected to room creator');
            });
        }
    });

    peer.on('connection', (conn) => {
        setupConnection(conn);
        console.log('New peer connected:', conn.peer);
    });
}
function setupConnection(conn) {
    connections.push(conn);
    
    conn.on('open', async () => {
        console.log('Connection opened with:', conn.peer);
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

    conn.on('data', async (data) => {
        console.log('Received data from peer:', data.type);
        if (data.type === 'audio') {
            const audioBlob = new Blob([data.audioData], { type: 'audio/webm' });
            await db.voices.add({
                voiceId: data.voiceId,
                blob: audioBlob,
                timestamp: data.timestamp,
                roomCode: currentRoom,
                userEmail: data.userEmail
            });

            displayRecording(
                URL.createObjectURL(audioBlob),
                true,
                data.timestamp,
                data.voiceId,
                data.userEmail
            );
        }
    });

    conn.on('close', () => {
        console.log('Connection closed:', conn.peer);
        connections = connections.filter(c => c !== conn);
    });
}