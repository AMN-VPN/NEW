// بررسی و اعتبارسنجی کد اتاق
document.getElementById('joinRoom').onclick = async () => {
    console.log('Processing room join request');
    const roomCode = document.getElementById('joinRoomInput').value.trim();
    console.log('Validating room code:', roomCode);
    
    // پاکسازی نمایش فعلی
    document.getElementById('recordings').innerHTML = '';
    console.log('Display cleared for new room');

    // راه‌اندازی اتصال جدید
    currentRoom = roomCode;
    console.log('Initializing connection for room:', roomCode);
    initializePeer(roomCode, false);
}

// بارگذاری پیام‌های موجود در اتاق
async function loadRoomMessages(roomCode) {
    console.log('Loading existing messages for room:', roomCode);
    const recordings = await db.voices
        .where('roomCode')
        .equals(roomCode)
        .toArray();
    console.log('Found recordings:', recordings.length);
}
