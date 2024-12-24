const db = new Dexie('voiceApp');

db.version(1).stores({
    rooms: '++id, roomCode, roomName, createdAt, members',
    userRooms: '++id, userEmail, roomCode, joinedAt'
});

class RoomsManager {
    constructor() {
        this.userEmail = localStorage.getItem('userEmail');
        this.initializeEvents();
        this.loadUserRooms();
        this.initializeWelcomeScreen();
    }

    initializeWelcomeScreen() {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.onclick = () => {
                document.getElementById('welcomeScreen').style.display = 'none';
                document.querySelector('.rooms-container').style.display = 'block';
            };
        }

        // همیشه اول صفحه خوش‌آمدگویی نمایش داده می‌شود
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.querySelector('.rooms-container').style.display = 'none';
    }

    initializeEvents() {
        const createNewRoomBtn = document.getElementById('createNewRoom');
        if (createNewRoomBtn) {
            createNewRoomBtn.onclick = () => {
                document.getElementById('newRoomModal').style.display = 'block';
            };
        }

        const confirmCreateRoomBtn = document.getElementById('confirmCreateRoom');
        if (confirmCreateRoomBtn) {
            confirmCreateRoomBtn.onclick = () => this.createNewRoom();
        }

        const cancelCreateRoomBtn = document.getElementById('cancelCreateRoom');
        if (cancelCreateRoomBtn) {
            cancelCreateRoomBtn.onclick = () => {
                document.getElementById('newRoomModal').style.display = 'none';
            };
        }
        
        // اضافه کردن عملکرد دکمه پروفایل
        const openProfileBtn = document.getElementById('openProfileBtn');
        if (openProfileBtn) {
            openProfileBtn.onclick = () => {
                document.querySelector('.rooms-container').style.display = 'none';
                document.getElementById('profileSection').style.display = 'flex';
            };
        }

        // اضافه کردن دکمه بازگشت به چت
        const backToMainChat = document.getElementById('backToMainChat');
        if (backToMainChat) {
            backToMainChat.onclick = () => {
                document.getElementById('profileSection').style.display = 'none';
                document.querySelector('.rooms-container').style.display = 'block';
            };
        }

        // اضافه کردن عملکرد دکمه خروج
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.onclick = () => {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('currentRoomCode');
                window.location.href = 'index.html';
            };
        }

        // اضافه کردن دکمه پیوستن به اتاق
        const joinRoomBtn = document.createElement('button');
        joinRoomBtn.className = 'primary-button';
        joinRoomBtn.textContent = 'پیوستن به اتاق';
        joinRoomBtn.onclick = () => this.showJoinRoomModal();
        
        document.querySelector('.rooms-header').appendChild(joinRoomBtn);

        // مدال پیوستن به اتاق
        const joinRoomModal = `
            <div id="joinRoomModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>پیوستن به اتاق</h3>
                    <input type="text" id="joinRoomCode" placeholder="کد اتاق را وارد کنید">
                    <button id="confirmJoinRoom" class="primary-button">پیوستن</button>
                    <button id="cancelJoinRoom" class="secondary-button">انصراف</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', joinRoomModal);

        // رویدادهای مدال پیوستن
        document.getElementById('confirmJoinRoom').onclick = () => this.joinExistingRoom();
        document.getElementById('cancelJoinRoom').onclick = () => {
            document.getElementById('joinRoomModal').style.display = 'none';
        };
    }

    showJoinRoomModal() {
        document.getElementById('joinRoomModal').style.display = 'flex';
    }

    async joinExistingRoom() {
        const roomCode = document.getElementById('joinRoomCode').value.trim();
        console.log('Attempting to join room:', roomCode);
        
        if (!roomCode) {
            alert('لطفا کد اتاق را وارد کنید');
            return;
        }

        try {
            // ذخیره کد اتاق در localStorage
            localStorage.setItem('currentRoomCode', roomCode);
            
            // هدایت کاربر به صفحه چت
            window.location.href = 'chat-room.html?join=true';
            
        } catch (error) {
            console.error('Error joining room:', error);
            alert('خطا در پیوستن به اتاق');
        }
    }
    async createNewRoom() {
        const roomName = document.getElementById('roomNameInput').value.trim();
        if (!roomName) return;

        const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        await db.rooms.add({
            roomCode,
            roomName,
            createdAt: new Date(),
            members: [this.userEmail]
        });

        await db.userRooms.add({
            userEmail: this.userEmail,
            roomCode,
            joinedAt: new Date()
        });

        document.getElementById('newRoomModal').style.display = 'none';
        this.loadUserRooms();
    }

    async loadUserRooms() {
        const userRooms = await db.userRooms
            .where('userEmail')
            .equals(this.userEmail)
            .toArray();

        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = '';

        for (const userRoom of userRooms) {
            const room = await db.rooms
                .where('roomCode')
                .equals(userRoom.roomCode)
                .first();

            if (room) {
                const roomElement = this.createRoomElement(room);
                roomsList.appendChild(roomElement);
            }
        }
    }
      createRoomElement(room) {
          const div = document.createElement('div');
          div.className = 'room-item';
          div.innerHTML = `
              <div class="room-info">
                  <div class="room-header">
                      <h3>${room.roomName}</h3>
                      <div class="room-menu">
                          <button class="menu-dots">⋮</button>
                          <div class="menu-popup" style="display: none;">
                              <button class="delete-room" data-room-code="${room.roomCode}">حذف اتاق</button>
                          </div>
                      </div>
                  </div>
                  <p>کد اتاق: ${room.roomCode}</p>
                  <small>${new Date(room.createdAt).toLocaleDateString('fa-IR')}</small>
              </div>
          `;

          // اضافه کردن رویداد منو
          const menuButton = div.querySelector('.menu-dots');
          const menuPopup = div.querySelector('.menu-popup');
          const deleteButton = div.querySelector('.delete-room');

          menuButton.onclick = (e) => {
              e.stopPropagation();
              menuPopup.style.display = menuPopup.style.display === 'none' ? 'block' : 'none';
          };

          deleteButton.onclick = async (e) => {
              e.stopPropagation();
              if (confirm('آیا مطمئن هستید که می‌خواهید این اتاق را حذف کنید؟')) {
                  const roomCode = e.target.dataset.roomCode;
                  await this.deleteRoom(roomCode);
              }
          };

          div.onclick = () => {
              localStorage.setItem('currentRoomCode', room.roomCode);
              window.location.href = 'chat-room.html';
          };

          return div;
      }

      async deleteRoom(roomCode) {
          try {
              await this.db.voices.where('roomCode').equals(roomCode).delete();
              await this.db.rooms.where('roomCode').equals(roomCode).delete();
              await this.db.userRooms.where('roomCode').equals(roomCode).delete();
              this.loadUserRooms();
          } catch (error) {
              console.error('Error deleting room:', error);
              alert('خطا در حذف اتاق');
          }
      }
  }
document.addEventListener('DOMContentLoaded', () => {
    new RoomsManager();
});