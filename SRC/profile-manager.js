class ProfileManager {
    constructor() {
        this.defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0xODAsMTgwYzAtNDQtNDAtODAtODAtODBzLTgwLDM2LTgwLDgwIiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';
        this.initializeProfile();
    }

    initializeProfile() {
        const openProfileBtn = document.getElementById('openProfileBtn');
        if (openProfileBtn) {
            openProfileBtn.onclick = () => this.showProfile();
        }

        const backToMainChat = document.getElementById('backToMainChat');
        if (backToMainChat) {
            backToMainChat.onclick = () => this.hideProfile();
        }

        this.loadUserInfo();
        this.bindProfileEvents();
    }

    showProfile() {
        document.querySelector('.rooms-container').style.display = 'none';
        document.getElementById('profileSection').style.display = 'flex';
    }

    hideProfile() {
        document.getElementById('profileSection').style.display = 'none';
        document.querySelector('.rooms-container').style.display = 'block';
    }

    loadUserInfo() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        const userName = localStorage.getItem('userName') || userEmail.split('@')[0];
        
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        
        if (profileName) profileName.textContent = userName;
        if (profileEmail) profileEmail.textContent = userEmail;
    }

    bindProfileEvents() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.onclick = () => {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('currentRoomCode');
                window.location.href = 'index.html';
            };
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});