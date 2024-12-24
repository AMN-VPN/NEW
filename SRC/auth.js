class Auth {
    constructor() {
        console.log('Auth module initialized');
        this.initEventListeners();
    }

    initEventListeners() {
        console.log('Initializing auth event listeners');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, setting up auth components');
            
            // تنظیم دکمه ارسال کد
            const sendCodeBtn = document.getElementById('sendCodeBtn');
            sendCodeBtn.onclick = async () => {
                console.log('Send code button clicked');
                const email = document.getElementById('emailInput').value;
                console.log('Processing email:', email);
            };

            // تنظیم دکمه تایید کد
            const verifyBtn = document.getElementById('verifyBtn');
            verifyBtn.onclick = async () => {
                console.log('Verify button clicked');
                const code = document.getElementById('verifyCode').value;
                console.log('Verifying code:', code);
            };
        });
    }

    async sendVerificationCode() {
        console.log('Starting verification code process');
        const email = document.getElementById('emailInput').value;
        if (!email || !email.includes('@')) {
            console.log('Invalid email entered:', email);
            alert('لطفا یک ایمیل معتبر وارد کنید');
            return;
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
   
        try {
            // Send email using EmailJS
            const response = await emailjs.send(
                "service_l5atf6s",
                "template_7ydvmlh",
                {
                    to_email: email,
                    verification_code: verifyCode,
                    from_name: "Globgram"
                }
            );

            // Save to database
            await db.users.put({
                email: email,
                verifyCode: verifyCode,
                verified: false,
                timestamp: new Date().getTime()
            });

            document.getElementById('verifySection').style.display = 'block';
            alert('کد تایید به ایمیل شما ارسال شد');
   
        } catch (error) {
            console.error('خطا در ارسال کد:', error);
            alert('خطا در ارسال کد. لطفا دوباره تلاش کنید.');
        }
    }

    async verifyCode() {
        console.log('Verifying entered code');
        const email = document.getElementById('emailInput').value;
        const code = document.getElementById('verifyCode').value;
       
        try {
            const user = await db.users.where('email').equals(email).first();
           
            if (user && user.verifyCode === code) {
                await db.users.where('email').equals(email).modify({ verified: true });
                localStorage.setItem('userEmail', email);
                currentUser = user;
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
            } else {
                alert('کد وارد شده صحیح نیست');
            }
        } catch (error) {
            console.error('خطا در تایید کد:', error);
            alert('خطا در تایید کد. لطفا دوباره تلاش کنید.');
        }
    }
}

// بررسی وضعیت نشست کاربر و بازیابی اطلاعات
async function checkUserSession() {
    console.log('Checking user session status');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        console.log('Found saved session for:', savedEmail);
        const user = await db.users.where('email').equals(savedEmail).first();
        console.log('User data retrieved:', user ? 'success' : 'not found');
    }
}

// بروزرسانی وضعیت احراز هویت کاربر
async function updateAuthStatus(email, verified) {
    console.log('Updating authentication status');
    await db.users.where('email').equals(email).modify({ 
        verified: verified,
        lastUpdate: Date.now() 
    });
    console.log('Auth status updated for:', email);
}
