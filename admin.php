<?php
$jsonFile = 'products.json';
$imageUploadDir = 'uploads/';

if (!file_exists($imageUploadDir)) {
    mkdir($imageUploadDir, 0777, true);
}

$products = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];

if (isset($_POST['delete']) && isset($_POST['delete_id'])) {
    $deleteId = $_POST['delete_id'];
    foreach ($products as $index => $product) {
        if ($product['id'] == $deleteId) {
            if (!empty($product['image_url']) && file_exists($product['image_url'])) {
                unlink($product['image_url']);
            }
            unset($products[$index]);
            $products = array_values($products);
            file_put_contents($jsonFile, json_encode($products, JSON_PRETTY_PRINT));
            break;
        }
    }
}

$editProduct = null;
if (isset($_GET['edit_id'])) {
    $editId = $_GET['edit_id'];
    foreach ($products as $product) {
        if ($product['id'] == $editId) {
            $editProduct = $product;
            break;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['save'])) {
    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $previous_price = $_POST['previous_price'];
    $discount = $_POST['discount'];
    $category = isset($_POST['category']) ? trim($_POST['category']) : '';
    $editId = $_POST['edit_id'] ?? null;

    $image_url = '';
    if (isset($_FILES['image_url']) && $_FILES['image_url']['error'] == 0) {
        $imageName = time() . '_' . basename($_FILES['image_url']['name']);
        $imagePath = $imageUploadDir . $imageName;
        move_uploaded_file($_FILES['image_url']['tmp_name'], $imagePath);
        $image_url = $imagePath;
    }

    if ($editId) {
        foreach ($products as &$product) {
            if ($product['id'] == $editId) {
                $product['name'] = $name;
                $product['description'] = $description;
                $product['price'] = $price;
                $product['previous_price'] = $previous_price;
                $product['discount'] = $discount;
                $product['category'] = $category;
                if ($image_url) {
                    if (!empty($product['image_url']) && file_exists($product['image_url'])) {
                        unlink($product['image_url']);
                    }
                    $product['image_url'] = $image_url;
                }
                break;
            }
        }
    } else {
        $newProduct = [
            'id' => count($products) ? max(array_column($products, 'id')) + 1 : 1,
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'previous_price' => $previous_price,
            'discount' => $discount,
            'category' => $category,
            'image_url' => $image_url
        ];
        $products[] = $newProduct;
    }

    file_put_contents($jsonFile, json_encode($products, JSON_PRETTY_PRINT));
    header("Location: admin.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>لوحة إدارة المنتجات</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
    <style>
        body { padding: 20px; background-color: #f8f9fa; }
        .card img { height: 150px; object-fit: cover; }
        .badge { font-size: 0.8rem; }
    </style>
</head>
<body>

<div class="container">
    <h2 class="mb-4"><?= $editProduct ? 'تعديل منتج' : 'إضافة منتج جديد' ?></h2>
    <form method="POST" action="admin.php" enctype="multipart/form-data" class="row g-3 bg-white p-4 rounded shadow-sm">
        <?php if ($editProduct): ?>
            <input type="hidden" name="edit_id" value="<?= $editProduct['id'] ?>">
        <?php endif; ?>

        <div class="col-md-6">
            <label class="form-label">اسم المنتج</label>
            <input type="text" class="form-control" name="name" value="<?= $editProduct['name'] ?? '' ?>" required>
        </div>

        <div class="col-md-6">
            <label class="form-label">الوصف</label>
            <textarea class="form-control" name="description" required><?= $editProduct['description'] ?? '' ?></textarea>
        </div>

        <div class="col-md-4">
            <label class="form-label">السعر</label>
            <input type="number" class="form-control" name="price" value="<?= $editProduct['price'] ?? '' ?>" required>
        </div>

        <div class="col-md-4">
            <label class="form-label">السعر السابق</label>
            <input type="number" class="form-control" name="previous_price" value="<?= $editProduct['previous_price'] ?? '' ?>" required>
        </div>

        <div class="col-md-4">
            <label class="form-label">الخصم (%)</label>
            <input type="number" class="form-control" name="discount" value="<?= $editProduct['discount'] ?? '' ?>" required>
        </div>

        <div class="col-md-6">
            <label class="form-label">الفئة</label>
            <select class="form-select mb-2" onchange="document.getElementById('category_input').value = this.value">
                <option value="">-- اختر فئة --</option>
                <option value="electronics">إلكترونيات</option>
                <option value="clothing">ملابس</option>
                <option value="home_appliances">أجهزة منزلية</option>
                <option value="books">كتب</option>
                <option value="toys">ألعاب</option>
            </select>
            <input type="text" class="form-control" name="category" id="category_input" placeholder="أو أدخل فئة جديدة" value="<?= $editProduct['category'] ?? '' ?>" required>
        </div>

        <div class="col-md-6">
            <label class="form-label">الصورة</label>
            <input type="file" class="form-control" name="image_url" accept="image/*">
        </div>

        <div class="col-12">
            <input type="submit" name="save" class="btn btn-primary w-100" value="<?= $editProduct ? 'تحديث المنتج' : 'إضافة المنتج' ?>">
        </div>
    </form>

    <hr class="my-5">

    <h3>قائمة المنتجات</h3>
    <div class="row g-3">
        <?php foreach ($products as $product): ?>
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="<?= htmlspecialchars($product['image_url']) ?>" class="card-img-top" alt="<?= htmlspecialchars($product['name']) ?>">
                        <span class="badge bg-danger position-absolute top-0 end-0 m-2">-<?= htmlspecialchars($product['discount']) ?>%</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title"><?= htmlspecialchars($product['name']) ?></h5>
                        <p class="card-text"><?= htmlspecialchars($product['description']) ?></p>
                        <p class="mb-1"><strong>السعر:</strong> <?= htmlspecialchars($product['price']) ?> د.أ</p>
                        <p class="text-muted"><strike><?= htmlspecialchars($product['previous_price']) ?> د.أ</strike></p>
                        <p><span class="badge bg-secondary"><?= htmlspecialchars($product['category']) ?></span></p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <form method="POST" action="admin.php">
                            <input type="hidden" name="delete_id" value="<?= $product['id'] ?>">
                            <input type="submit" name="delete" class="btn btn-sm btn-danger" value="حذف" onclick="return confirm('هل أنت متأكد؟')">
                        </form>
                        <form method="GET" action="admin.php">
                            <input type="hidden" name="edit_id" value="<?= $product['id'] ?>">
                            <input type="submit" class="btn btn-sm btn-warning" value="تعديل">
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

</body>
</html>
