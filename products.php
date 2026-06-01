<?php
// تحميل المنتجات من JSON
$jsonFile = 'products.json';
$products = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];

// هذه هي الفئات المعرّفة مسبقًا في admin.php
$allCategories = [
    'electronics' => 'إلكترونيات',
    'clothing' => 'ملابس',
    'home_appliances' => 'أجهزة منزلية',
    'books' => 'كتب',
    'toys' => 'ألعاب'
];

// الفئة المحددة (إن وجدت)
$selectedCategory = $_GET['category'] ?? '';
?>
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>عرض المنتجات</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
        }
        .category-boxes {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        .category-box {
            padding: 10px 20px;
            border: 1px solid #007BFF;
            background-color: #f0f8ff;
            color: #007BFF;
            cursor: pointer;
            text-decoration: none;
            border-radius: 5px;
            transition: 0.3s;
        }
        .category-box:hover {
            background-color: #007BFF;
            color: white;
        }
        .category-box.active {
            background-color: #007BFF;
            color: white;
            font-weight: bold;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 16px 20px;
            background: #072f57;
            border-radius: 20px;
            box-shadow: 0 12px 26px rgba(0,0,0,0.16);
            margin-bottom: 24px;
        }
        .lang-switch {
            display: flex;
            align-items: center;
            gap: 0.7rem;
            background: #ffffff;
            border-radius: 999px;
            padding: 10px 16px;
            color: #0f172a;
            font-weight: 700;
            font-size: 1rem;
        }
        .lang-switch .flag-emoji {
            font-size: 1.3rem;
        }
        .search-bar {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: #ffffff;
            border-radius: 999px;
            padding: 10px 16px;
            min-width: 280px;
            max-width: 640px;
        }
        .search-bar i {
            color: #718096;
            font-size: 1.1rem;
        }
        .search-bar input {
            width: 100%;
            border: none;
            outline: none;
            font-size: 1rem;
            color: #0f172a;
            background: transparent;
        }
        .brand {
            text-align: right;
            color: #ffffff;
        }
        .brand .main {
            display: block;
            font-size: 1.5rem;
            font-weight: 900;
        }
        .brand .sub {
            display: block;
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 2px;
        }
        .product-list {
            display: flex;
            flex-wrap: wrap;
        }
        .product {
            border: 1px solid #ddd;
            margin: 10px;
            padding: 15px;
            width: 200px;
            text-align: center;
        }
        .product img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }
        h1 {
            text-align: center;
        }
    </style>
</head>
<body>

<header>
    <div class="header">
        <div class="lang-switch">
            <span class="flag-emoji">🇶🇦</span>
            <span>عربي</span>
        </div>
        <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="بحث عن أي منتج" aria-label="بحث عن أي منتج">
        </div>
        <div class="brand">
            <span class="main">ودام</span>
            <span class="sub">widam</span>
        </div>
    </div>
</header>

<h1>المنتجات</h1>

<!-- صناديق الفئات -->
<div class="category-boxes">
    <a href="?" class="category-box <?= $selectedCategory == '' ? 'active' : '' ?>">جميع الأوزان</a>
    <?php foreach ($allCategories as $key => $label): ?>
        <a href="?category=<?= urlencode($key) ?>" class="category-box <?= $selectedCategory == $key ? 'active' : '' ?>">
            <?= htmlspecialchars($label) ?>
        </a>
    <?php endforeach; ?>
</div>

<!-- عرض المنتجات -->
<div class="product-list">
    <?php
    $found = false;
    foreach ($products as $product) {
        if ($selectedCategory && $product['category'] !== $selectedCategory) continue;

        $found = true;
        echo '<div class="product">';
        echo '<img src="' . htmlspecialchars($product['image_url']) . '" alt="' . htmlspecialchars($product['name']) . '">';
        echo '<h4>' . htmlspecialchars($product['name']) . '</h4>';
        echo '<p>' . htmlspecialchars($product['description']) . '</p>';
        echo '<p>السعر: ' . htmlspecialchars($product['price']) . ' ريال</p>';
        echo '<p>الوزن: ' . htmlspecialchars($allCategories[$product["category"]] ?? $product["category"]) . '</p>';
        echo '</div>';
    }

    if (!$found) {
        echo "<p>لا توجد منتجات بهذا الوزن.</p>";
    }
    ?>
</div>

</body>
</html>
