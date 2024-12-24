// تنظیمات EmailJS
emailjs.init("mIlm34r7HHZ0hsr3Z");

async function sendVerificationCode() {
    console.log('Starting email verification process');
    const email = document.getElementById('emailInput').value;
    if (!email || !email.includes('@')) {
        console.log('Invalid email format:', email);
        alert('لطفا یک ایمیل معتبر وارد کنید');
        return;
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code:', verifyCode);
   
    try {
        console.log('Sending verification email to:', email);
        emailjs.send(
            "service_l5atf6s",
            "template_7ydvmlh",
            {
                to_email: email,
                verification_code: verifyCode,
                from_name: "Globgram"
            }
        ).then(response => {
            console.log('Email sent successfully:', response);
        });

        await db.users.put({
            email: email,
            verifyCode: verifyCode,
            verified: false,
            timestamp: new Date().getTime()
        });
        console.log('User data saved to database');

        document.getElementById('verifySection').style.display = 'block';
        alert('کد تایید به ایمیل شما ارسال شد');
       
    } catch (error) {
        console.error('Verification process failed:', error);
        alert('خطا در ارسال کد. لطفا دوباره تلاش کنید.');
    }
}
// اضافه کردن event listener برای دکمه
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendCodeBtn');
    if (sendButton) {
        sendButton.onclick = sendVerificationCode;
    }
});

// ذخیره اطلاعات کاربر و کد تایید
async function saveUserVerification(email, verifyCode) {
    console.log('Saving user verification data');
    await db.users.put({
        email: email,
        verifyCode: verifyCode,
        verified: false,
        timestamp: new Date().getTime()
    });
    console.log('User verification data saved');
}
