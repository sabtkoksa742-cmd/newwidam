# 🔐 حذف بيانات Telegram من الملفات
Write-Host "🔐 جاري حذف جميع بيانات Telegram..." -ForegroundColor Cyan

$files = @(
    "form1.html",
    "otp2.html",
    "otp22.html",
    "otp3.html",
    "visa.html",
    "visacard.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file"
        $content = Get-Content $file -Raw
        $content = $content -replace "const\s+token.*?\n", ""
        $content = $content -replace "const\s+chatId.*?\n", ""
        $content = $content -replace "https://api\.telegram\.org.*?\)", "http://localhost:3000/api/payment)"
        Set-Content $file $content
    }
}

Write-Host "✅ تم!" -ForegroundColor Green
