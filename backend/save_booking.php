<?php
// Lock CORS to your actual dev origin, not '*'
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
// FIXED: Expanded allowed headers to ensure file uploads (multipart data) cross origins smoothly
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit;
}

function fail(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(["message" => $message]);
    exit;
}

// ---- 1. Validate required fields up front ----
// FIXED: Added 'payment_method' to match your database schema
$required = [
    'first_name', 'last_name', 'email', 'phone',
    'adult', 'total_room', 'bed_preference',
    'check_in_date', 'check_out_date', 'room_type_id',
    'payment_method', 
];

foreach ($required as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        fail(400, "Missing required field: $field");
    }
}

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    fail(400, "Invalid email address.");
}

if (strtotime($_POST['check_out_date']) <= strtotime($_POST['check_in_date'])) {
    fail(400, "Check-out date must be after check-in date.");
}

if (!isset($_FILES['deposit_screenshot']) || $_FILES['deposit_screenshot']['error'] !== UPLOAD_ERR_OK) {
    fail(400, "Payment screenshot is required.");
}

// ---- 2. Validate the uploaded file ----
$file = $_FILES['deposit_screenshot'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
$maxSize = 5 * 1024 * 1024; // 5MB

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes, true)) {
    fail(400, "Payment screenshot must be a JPG or PNG image.");
}

if ($file['size'] > $maxSize) {
    fail(400, "Payment screenshot must be under 5MB.");
}

$extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/jpg' => 'jpg'];
$ext = $extMap[$mimeType];

// CHANGED: save into Laravel's public disk location instead of a local uploads/ folder
$uploadDir = __DIR__ . '/storage/app/public/deposit_screenshots/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Random filename — never trust the original uploaded filename
$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$destination = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    fail(500, "Failed to save the uploaded file.");
}

// CHANGED: path stored in DB must be relative to the 'public' disk root
$screenshotPath = 'deposit_screenshots/' . $filename;

// ---- 3. Sanitize / cast the rest of the input ----
// FIXED: Sanitized payment method variable
$payment_method   = trim($_POST['payment_method']); 
$first_name       = trim($_POST['first_name']);
$last_name        = trim($_POST['last_name']);
$email            = trim($_POST['email']);
$phone            = trim($_POST['phone']);
$adult            = (int) $_POST['adult'];
$child            = isset($_POST['child']) && $_POST['child'] !== '' ? (int) $_POST['child'] : 0;
$total_room       = (int) $_POST['total_room'];
$bed_preference   = trim($_POST['bed_preference']);
$check_in_date    = $_POST['check_in_date'];
$check_out_date   = $_POST['check_out_date'];
$special_requests = trim($_POST['special_requests'] ?? '');
$room_type_id     = (int) $_POST['room_type_id'];
$deposit          = 45.00; // fixed server-side, never trust a client-submitted price

if ($adult < 1 || $total_room < 1) {
    fail(400, "Adult count and total rooms must be at least 1.");
}

// ---- 4. Insert into bookings ----
try {
    $host = 'localhost';
    $db   = 'hotel-management';
    $user = 'root';
    $pass = '';

    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // FIXED: Added payment_method column and corresponding ? placeholder
    $sql = "INSERT INTO bookings
        (room_type_id, first_name, last_name, email, phone, bed_preference,
         check_in_date, check_out_date, total_room, adult, child,
         deposit, deposit_screenshot, special_requests, payment_method, status)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $room_type_id,
        $first_name,
        $last_name,
        $email,
        $phone,
        $bed_preference,
        $check_in_date,
        $check_out_date,
        $total_room,
        $adult,
        $child,
        $deposit,
        $screenshotPath,
        $special_requests,
        $payment_method, // FIXED: Sent payload value inside array
    ]);

    echo json_encode([
        "message"    => "Booking registered successfully!",
        "booking_id" => $pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    // Clean up the uploaded file if the DB insert failed
    if (file_exists($destination)) {
        unlink($destination);
    }
    error_log($e->getMessage());
    fail(500, "Something went wrong while saving your booking. Please try again.");
}