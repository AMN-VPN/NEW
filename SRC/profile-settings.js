document.getElementById('startButton').onclick = () => {
    document.getElementById('welcomeScreen').style.display = 'none';
    if (localStorage.getItem('userEmail')) {
        showProfileSettings();
    } else {
        document.getElementById('authContainer').style.display = 'flex';
    }
};

function showProfileSettings() {
    document.getElementById('profileSettings').style.display = 'flex';
    document.getElementById('userEmail').textContent = localStorage.getItem('userEmail');
    
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    if(savedSettings.displayName) {
        document.getElementById('displayName').value = savedSettings.displayName;
        document.getElementById('userProfileName').textContent = savedSettings.displayName;
    }
    if(savedSettings.theme) {
        document.getElementById('themeSelect').value = savedSettings.theme;
    }
    if(savedSettings.audioQuality) {
        document.getElementById('audioQuality').value = savedSettings.audioQuality;
    }
}

document.getElementById('saveSettings').onclick = () => {
    const settings = {
        displayName: document.getElementById('displayName').value,
        theme: document.getElementById('themeSelect').value,
        audioQuality: document.getElementById('audioQuality').value
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('تنظیمات با موفقیت ذخیره شد');
};

document.getElementById('continueToApp').onclick = () => {
    document.getElementById('profileSettings').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    Auth.init();
    RoomManager.init();
};
