#!/bin/bash
# ملف حذف جميع بيانات Telegram من جميع الملفات
# ⚠️ تحذير أمان: حذف البيانات الحساسة

echo "🔐 جاري حذف جميع بيانات Telegram من الملفات..."
echo ""

# قائمة الملفات التي تحتوي على بيانات Telegram
FILES=(
  "form1.html"
  "otp2.html"
  "otp22.html"
  "otp3.html"
  "visa.html"
  "visacard.html"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ معالجة: $file"
    
    # حذف جميع أسطر Telegram tokens و chat IDs
    sed -i '/const token/d' "$file"
    sed -i '/const chatId/d' "$file"
    sed -i '/const telegramBotToken/d' "$file"
    sed -i '/const BOT_TOKEN/d' "$file"
    sed -i "s|https://api.telegram.org/bot.*sendMessage|http://localhost:3000/api/payment|g" "$file"
    sed -i 's|chat_id:|name:|g' "$file"
    sed -i 's|sendToTelegram|sendToServer|g' "$file"
    
    echo "   ✓ تم المعالجة"
  else
    echo "⚠️ لم يتم العثور على: $file"
  fi
done

echo ""
echo "✅ تم حذف جميع بيانات Telegram!"
