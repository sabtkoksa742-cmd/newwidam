/**
 * ⚙️ إعدادات وتخصيصات متقدمة
 * عدّل هذا الملف حسب احتياجاتك
 */

// ==================== إعدادات الخادم ====================

const SERVER_CONFIG = {
    // عنوان الخادم
    HOST: 'localhost',
    PORT: 3000,
    
    // الحصول على الرابط الكامل
    getURL() {
        return `http://${this.HOST}:${this.PORT}`;
    },
    
    // الحصول على رابط API
    getAPIURL(endpoint) {
        return `${this.getURL()}/api${endpoint}`;
    }
};

// ==================== إعدادات الدفع ====================

const PAYMENT_CONFIG = {
    // الحد الأدنى والأقصى للدفعة
    MIN_AMOUNT: 0.5,      // 0.5 دينار
    MAX_AMOUNT: 10000,    // 10000 دينار
    DEFAULT_CURRENCY: 'KD',
    
    // قائمة البنوك المدعومة
    SUPPORTED_BANKS: [
        { code: 'ABK', name: 'البنك الأهلي المتحد' },
        { code: 'RAJHI', name: 'مصرف الراجحي' },
        { code: 'NBK', name: 'بنك الكويت الوطني' },
        { code: 'KIB', name: 'بنك الكويت الدولي' },
        { code: 'BOUBYAN', name: 'بنك بوبيان' },
        { code: 'BURGAN', name: 'بنك برقان' },
        { code: 'CBK', name: 'البنك التجاري الكويتي' },
        { code: 'KFH', name: 'بيت التمويل الكويتي' },
        { code: 'GBK', name: 'بنك الخليج' },
        { code: 'WARBA', name: 'بنك وربة' }
    ],
    
    // حالات الدفع
    PAYMENT_STATUSES: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
    },
    
    // حالات الطلبات
    ORDER_STATUSES: {
        PENDING: 'pending',
        PAID: 'paid',
        SHIPPED: 'shipped',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    }
};

// ==================== إعدادات الأمان ====================

const SECURITY_CONFIG = {
    // كلمة السر الإدارية (غيّرها!)
    ADMIN_PASSWORD: 'admin123',
    
    // هل نحفظ بيانات الـ PIN؟ (خطر - استخدم بحذر!)
    SAVE_PIN: false,
    
    // هل نحفظ البطاقة الكاملة؟ (خطر - استخدم بحذر!)
    SAVE_FULL_CARD: false,
    
    // مدة انتهاء الجلسة (بالدقائق)
    SESSION_TIMEOUT: 30,
    
    // عدد محاولات تسجيل الدخول المسموحة
    MAX_LOGIN_ATTEMPTS: 5,
    
    // مدة تجميد الحساب بعد محاولات فاشلة (بالدقائق)
    LOCKOUT_DURATION: 15
};

// ==================== إعدادات الإشعارات ====================

const NOTIFICATION_CONFIG = {
    // هل نُرسل إشعارات؟
    ENABLED: true,
    
    // أنواع الإشعارات
    TYPES: {
        EMAIL: 'email',
        SMS: 'sms',
        PUSH: 'push',
        CONSOLE: 'console'  // للاختبار فقط
    },
    
    // البريد الإلكتروني للإرسال من عنده
    EMAIL_FROM: 'noreply@payment-system.com',
    
    // رقم الهاتف لإرسال الـ SMS
    PHONE_FROM: '+96598765432',
    
    // متى نرسل إشعارات؟
    TRIGGERS: {
        NEW_PAYMENT: true,      // دفعة جديدة
        PAYMENT_SUCCESS: true,  // نجاح الدفعة
        PAYMENT_FAILED: true,   // فشل الدفعة
        NEW_ORDER: true,        // طلب جديد
        ORDER_SHIPPED: true,    // إرسال الطلب
        ORDER_DELIVERED: true   // استلام الطلب
    }
};

// ==================== إعدادات التقارير ====================

const REPORTS_CONFIG = {
    // تنسيقات التقارير
    FORMATS: {
        JSON: 'json',
        CSV: 'csv',
        PDF: 'pdf',
        EXCEL: 'excel'
    },
    
    // فترات التقارير المسموحة
    PERIODS: {
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly',
        YEARLY: 'yearly',
        CUSTOM: 'custom'
    },
    
    // الإحصائيات المضمنة في التقرير
    INCLUDED_STATS: [
        'total_payments',
        'total_amount',
        'average_amount',
        'payment_methods',
        'success_rate',
        'top_banks',
        'top_customers'
    ]
};

// ==================== إعدادات قاعدة البيانات ====================

const DATABASE_CONFIG = {
    // مسار حفظ البيانات
    DATA_DIR: './data',
    
    // أسماء الملفات
    FILES: {
        PAYMENTS: 'payments.json',
        ORDERS: 'orders.json',
        CUSTOMERS: 'customers.json',
        LOGS: 'logs.json'
    },
    
    // هل نعمل نسخة احتياطية تلقائياً؟
    AUTO_BACKUP: true,
    
    // عدد النسخ الاحتياطية المحفوظة
    BACKUP_COUNT: 5,
    
    // حجم الملف الأقصى قبل الأرشفة (بالميجابايت)
    MAX_FILE_SIZE: 100
};

// ==================== إعدادات الواجهة ====================

const UI_CONFIG = {
    // الألوان
    COLORS: {
        PRIMARY: '#667eea',
        SUCCESS: '#4CAF50',
        ERROR: '#f44336',
        WARNING: '#ff9800',
        INFO: '#2196F3'
    },
    
    // اللغة الافتراضية
    DEFAULT_LANGUAGE: 'ar',
    
    // اتجاه النص
    DIRECTION: 'rtl',
    
    // الخط المستخدم
    FONT_FAMILY: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    
    // حجم الجداول
    ITEMS_PER_PAGE: 10,
    
    // مدة ظهور الإشعارات (بالميلي ثانية)
    NOTIFICATION_DURATION: 3000
};

// ==================== دوال مساعدة للتكوين ====================

class ConfigManager {
    /**
     * الحصول على إعداد معين
     */
    static getSetting(category, key) {
        const config = {
            'server': SERVER_CONFIG,
            'payment': PAYMENT_CONFIG,
            'security': SECURITY_CONFIG,
            'notification': NOTIFICATION_CONFIG,
            'reports': REPORTS_CONFIG,
            'database': DATABASE_CONFIG,
            'ui': UI_CONFIG
        };
        
        if (!config[category]) {
            console.error(`❌ فئة غير موجودة: ${category}`);
            return null;
        }
        
        if (!config[category][key]) {
            console.warn(`⚠️ إعداد غير موجود: ${category}.${key}`);
            return null;
        }
        
        return config[category][key];
    }
    
    /**
     * تعيين إعداد معين
     */
    static setSetting(category, key, value) {
        const config = {
            'server': SERVER_CONFIG,
            'payment': PAYMENT_CONFIG,
            'security': SECURITY_CONFIG,
            'notification': NOTIFICATION_CONFIG,
            'reports': REPORTS_CONFIG,
            'database': DATABASE_CONFIG,
            'ui': UI_CONFIG
        };
        
        if (config[category]) {
            config[category][key] = value;
            console.log(`✅ تم تعيين ${category}.${key}`);
        } else {
            console.error(`❌ فئة غير موجودة: ${category}`);
        }
    }
    
    /**
     * طباعة جميع الإعدادات
     */
    static printAll() {
        console.log(`
╔════════════════════════════════════════╗
║          جميع الإعدادات                ║
╚════════════════════════════════════════╝

📡 إعدادات الخادم:
${JSON.stringify(SERVER_CONFIG, null, 2)}

💳 إعدادات الدفع:
${JSON.stringify(PAYMENT_CONFIG, null, 2)}

🔒 إعدادات الأمان:
${JSON.stringify(SECURITY_CONFIG, null, 2)}

🔔 إعدادات الإشعارات:
${JSON.stringify(NOTIFICATION_CONFIG, null, 2)}

📊 إعدادات التقارير:
${JSON.stringify(REPORTS_CONFIG, null, 2)}

💾 إعدادات قاعدة البيانات:
${JSON.stringify(DATABASE_CONFIG, null, 2)}

🎨 إعدادات الواجهة:
${JSON.stringify(UI_CONFIG, null, 2)}
        `);
    }
    
    /**
     * التحقق من الإعدادات
     */
    static validate() {
        console.log('🔍 جاري التحقق من الإعدادات...');
        
        let isValid = true;
        
        // التحقق من أن كلمة السر تم تغييرها
        if (SECURITY_CONFIG.ADMIN_PASSWORD === 'admin123') {
            console.warn('⚠️ تحذير: استخدم كلمة سر أقوى بدلاً من admin123');
            isValid = false;
        }
        
        // التحقق من أن PORT رقم صحيح
        if (!Number.isInteger(SERVER_CONFIG.PORT) || SERVER_CONFIG.PORT < 1 || SERVER_CONFIG.PORT > 65535) {
            console.error('❌ خطأ: PORT يجب أن يكون بين 1 و 65535');
            isValid = false;
        }
        
        // التحقق من أن MIN_AMOUNT أقل من MAX_AMOUNT
        if (PAYMENT_CONFIG.MIN_AMOUNT >= PAYMENT_CONFIG.MAX_AMOUNT) {
            console.error('❌ خطأ: MIN_AMOUNT يجب أن يكون أقل من MAX_AMOUNT');
            isValid = false;
        }
        
        if (isValid) {
            console.log('✅ جميع الإعدادات صحيحة');
        }
        
        return isValid;
    }
}

// ==================== أمثلة الاستخدام ====================

/*
// الحصول على إعداد
ConfigManager.getSetting('payment', 'MIN_AMOUNT');

// تعيين إعداد
ConfigManager.setSetting('security', 'ADMIN_PASSWORD', 'your-strong-password');

// طباعة جميع الإعدادات
ConfigManager.printAll();

// التحقق من الإعدادات
ConfigManager.validate();
*/

console.log(`
✅ تم تحميل إعدادات النظام بنجاح!

📚 الفئات المتاحة:
- SERVER_CONFIG
- PAYMENT_CONFIG
- SECURITY_CONFIG
- NOTIFICATION_CONFIG
- REPORTS_CONFIG
- DATABASE_CONFIG
- UI_CONFIG

استخدم ConfigManager للتحكم في الإعدادات
`);

// التحقق من الإعدادات عند التحميل
ConfigManager.validate();
