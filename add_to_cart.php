<?php
session_start();

// إذا لم تكن السلة موجودة، ننشئها
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// إضافة المنتج إلى السلة
if (isset($_POST['product_id'])) {
    $productId = $_POST['product_id'];
    // نضيف المنتج إلى السلة (يمكنك البحث عن المنتج في ملف JSON وإضافته هنا)
    $_SESSION['cart'][] = $productId;  // نضيف فقط الـ ID أو نبحث عن المنتج الكامل إذا أردت
}

// إعادة التوجيه إلى الصفحة الرئيسية بعد إضافة المنتج
header("Location: index.php");
exit;
?>
