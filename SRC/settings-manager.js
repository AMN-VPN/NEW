class SettingsManager {
    constructor() {
        console.log('SettingsManager initialized');
        document.addEventListener('DOMContentLoaded', () => {
            this.bindSettingsEvents();
            this.loadInitialSettings();
        });
    }

    bindSettingsEvents() {
        console.log('Binding settings events');
        const accountSettings = document.getElementById('accountSettings');
        const backToProfile = document.getElementById('backToProfile');
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const saveUserNameBtn = document.getElementById('saveUserNameBtn');

        if (accountSettings) {
            accountSettings.onclick = () => {
                console.log('Opening account settings');
                const settingsPanel = document.getElementById('accountSettingsPanel');
                settingsPanel.style.display = 'block';
                setTimeout(() => {
                    settingsPanel.style.transform = 'translateX(0)';
                }, 10);
            };
        }

        if (backToProfile) {
            backToProfile.onclick = () => {
                console.log('Closing account settings');
                const settingsPanel = document.getElementById('accountSettingsPanel');
                settingsPanel.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    settingsPanel.style.display = 'none';
                }, 300);
            };
        }

        if (changeAvatarBtn) {
            changeAvatarBtn.onclick = () => this.handleAvatarChange();
        }

        if (saveUserNameBtn) {
            saveUserNameBtn.onclick = () => this.handleUserNameSave();
        }
    }

    loadInitialSettings() {
        console.log('Loading initial settings');
        const profileAvatar = document.getElementById('profileAvatar');
        const userNameInput = document.getElementById('userNameInput');
        
        if (profileAvatar) {
            profileAvatar.src = localStorage.getItem('userAvatar') || this.defaultAvatar;
        }
        
        if (userNameInput) {
            userNameInput.value = localStorage.getItem('userName') || '';
        }
    }

    handleAvatarChange() {
        console.log('Handling avatar change');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imageUrl = reader.result;
                    document.getElementById('profileAvatar').src = imageUrl;
                    localStorage.setItem('userAvatar', imageUrl);
                };
                reader.readAsDataURL(file);
            }
        };
    }

    handleUserNameSave() {
        console.log('Saving username');
        const userNameInput = document.getElementById('userNameInput');
        const newUserName = userNameInput.value.trim();
        
        if (newUserName) {
            localStorage.setItem('userName', newUserName);
            document.getElementById('profileName').textContent = newUserName;
            alert('نام کاربری با موفقیت تغییر کرد');
        } else {
            alert('لطفا یک نام معتبر وارد کنید');
        }
    }
}

new SettingsManager();