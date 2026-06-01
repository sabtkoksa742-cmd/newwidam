# PowerShell - حذف جميع بيانات Telegram من الملفات
# ⚠️ تحذير أمان: حذف البيانات الحساسة

Write-Host "🔐 جاري حذف جميع بيانات Telegram من الملفات..." -ForegroundColor Cyan
Write-Host ""

# قائمة الملفات التي تحتوي على بيانات Telegram
$files = @(
    "form1.html",
    "otp2.html",
    "otp22.html",
    "otp3.html",
    "visa.html",
    "visacard.html",
    "carttest.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ معالجة: $file" -ForegroundColor Green
        
        # قراءة الملف
        $content = Get-Content $file -Raw
        
        # حذف جميع أسطر Telegram tokens و chat IDs
        $content = $content -replace "const\s+token\s*=\s*", "// REMOVED: "
        $content = $content -replace "const\s+chatId\s*=\s*", "// REMOVED: "
        $content = $content -replace "const\s+telegramBotToken\s*=\s*", "// REMOVED: "
        $content = $content -replace "const\s+BOT_TOKEN\s*=\s*", "// REMOVED: "
        $content = $content -replace "https://api.telegram.org", "http://localhost:3000"
        $content = $content -replace "chat_id:", "name:"
        $content = $content -replace "sendToTelegram", "sendToServer"
        $content = $content -replace "sendTelegramMessage", "sendServerMessage"
        
        # كتابة الملف
        Set-Content $file $content
        
        Write-Host "   ✓ تم المعالجة" -ForegroundColor White
    } else {
        Write-Host "⚠️ لم يتم العثور على: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ تم حذف جميع بيانات Telegram!" -ForegroundColor Green
Write-Host "📝 ملاحظة: تأكد من اختبار جميع الملفات" -ForegroundColor Cyan
