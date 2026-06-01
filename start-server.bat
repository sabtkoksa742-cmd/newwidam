@echo off
REM ملف تشغيل الخادم على Windows

echo.
echo ╔════════════════════════════════════════╗
echo ║   🚀 خادم الدفع المحلي                   ║
echo ║   تم إنشاؤه بواسطة Node.js              ║
echo ╚════════════════════════════════════════╝
echo.

REM التحقق من تثبيت Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ خطأ: Node.js غير مثبت على جهازك!
    echo.
    echo الرجاء تحميل Node.js من: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js مثبت
echo.

REM التحقق من وجود package.json
if not exist "package.json" (
    echo ❌ خطأ: لم يتم العثور على package.json
    echo.
    pause
    exit /b 1
)

echo 📦 جاري تثبيت المكتبات...
call npm install

if errorlevel 1 (
    echo ❌ فشل تثبيت المكتبات!
    pause
    exit /b 1
)

echo.
echo ✅ تم تثبيت المكتبات بنجاح!
echo.

echo 🚀 جاري تشغيل الخادم...
echo.
echo ╔════════════════════════════════════════╗
echo ║  الخادم قيد التشغيل                     ║
echo ║  اضغط Ctrl + C لإيقافه                 ║
echo ╚════════════════════════════════════════╝
echo.

call node server.js

pause
