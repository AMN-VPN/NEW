// تنظیمات اولیه EmailJS
emailjs.init("mIlm34r7HHZ0hsr3Z");
console.log('EmailJS initialized');

// ارسال کد تایید به ایمیل کاربر
async function sendVerificationCode() {
    console.log('Starting email verification');
    const email = document.getElementById('emailInput').value;
    console.log('Target email:', email);

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code:', verifyCode);
   
    try {
        console.log('Sending verification email');
        await emailjs.send("service_l5atf6s", "template_0ahwrci", {
            to_email: email,
            verification_code: verifyCode,
            from_name: "Globgram"
        });
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

// بررسی صحت ایمیل و ارسال کد تایید
async function validateAndSendCode() {
    console.log('Starting email validation process');
    const email = document.getElementById('emailInput').value;
    console.log('Validating email:', email);

    if (!email || !email.includes('@')) {
        console.log('Invalid email format detected');
        return false;
    }
    console.log('Email format validated');
    return true;
}

// ذخیره‌سازی و مدیریت کد تایید
async function processVerificationCode(email, verifyCode) {
    console.log('Processing verification for:', email);
    try {
        await db.users.put({
            email: email,
            verifyCode: verifyCode,
            verified: false,
            timestamp: Date.now()
        });
        console.log('Verification data saved successfully');
        return true;
    } catch (error) {
        console.error('Verification processing failed:', error);
        return false;
    }
}
