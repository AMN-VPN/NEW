console.log('Database schema initialized');

// تنظیم اطلاعات کاربر
const userEmail = localStorage.getItem('userEmail');
window.currentUser = { email: userEmail || 'guest@example.com' };

// Unique voice ID generator
function generateVoiceId() {
    const voiceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated voice ID:', voiceId);
    return voiceId;
}

window.voiceManager = {
    recorder: null,
    chunks: [],

    async startRecording() {
        if (!currentRoom) {
            alert('لطفا ابتدا وارد یک اتاق شوید');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);
            this.chunks = [];

            this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
            
            this.recorder.onstop = async () => {
                const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
                const timestamp = Date.now();
                const voiceId = generateVoiceId();
                const userAvatar = localStorage.getItem('userAvatar') || defaultAvatar;
                const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail').split('@')[0];

                await db.voices.add({
                    voiceId,
                    blob: audioBlob,
                    timestamp,
                    roomCode: currentRoom,
                    userEmail: localStorage.getItem('userEmail'),
                    userAvatar,
                    userName
                });

                displayRecording(
                    URL.createObjectURL(audioBlob),
                    false,
                    timestamp,
                    voiceId,
                    localStorage.getItem('userEmail'),
                    userAvatar,
                    userName
                );

                if (connections && connections.length > 0) {
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    connections.forEach(conn => {
                        if (conn && conn.open) {
                            conn.send({
                                type: 'audio',
                                audioData: arrayBuffer,
                                timestamp,
                                voiceId,
                                userEmail: localStorage.getItem('userEmail'),
                                userAvatar,
                                userName
                            });
                        }
                    });
                }
            };

            this.recorder.start();
            document.getElementById('recordButton').disabled = true;
            document.getElementById('stopButton').disabled = false;

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('لطفا دسترسی میکروفون را فعال کنید');
        }
    },

    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
            document.getElementById('recordButton').disabled = false;
            document.getElementById('stopButton').disabled = true;
        }
    }
};
window.VoiceRecorder = voiceManager;

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0xODAsMTgwYzAtNDQtNDAtODAtODAtODBzLTgwLDM2LTgwLDgwIiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';
