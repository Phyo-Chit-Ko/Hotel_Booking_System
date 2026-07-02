<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$screenshot_path = null;
$guest_id = null;

try {
    // 1. ADD THIS CONNECTION BLOCK BACK
    $host = 'localhost';
    $db   = 'hotel-management';
    $user = 'root';
    $pass = '';
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Start the transaction
    $pdo->beginTransaction();

    // 3. Handle File Upload
    if (isset($_FILES['deposit_screenshot']) && $_FILES['deposit_screenshot']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        $filename = time() . '_' . basename($_FILES['deposit_screenshot']['name']);
        $screenshot_path = $upload_dir . $filename;
        move_uploaded_file($_FILES['deposit_screenshot']['tmp_name'], $screenshot_path);
    }

    // 4. Insert Guest
    $sqlGuest = "INSERT INTO guests (first_name, last_name, email, phone, nationality) VALUES (?, ?, ?, ?, ?)";
    $stmtG = $pdo->prepare($sqlGuest);
    $stmtG->execute([
        $_POST['first_name'],
        $_POST['last_name'],
        $_POST['email'],
        $_POST['phone'],
        $_POST['nationality']
    ]);

    $guest_id = $pdo->lastInsertId();

    // 5. Insert Booking
    if ($guest_id) {
        $sqlBooking = "INSERT INTO bookings 
            (guest_id, room_type_id, bed_preference, check_in_date, check_out_date, total_room, adult, child, deposit, deposit_screenshot, special_requests, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";

        $pdo->prepare($sqlBooking)->execute([
            $guest_id,
            $_POST['room_type_id'],
            $_POST['bed_preference'],
            $_POST['check_in_date'],
            $_POST['check_out_date'],
            $_POST['total_room'],
            $_POST['adult'],
            $_POST['child'],
            $_POST['deposit'],
            $screenshot_path,
            $_POST['special_requests']
        ]);
    }

    $pdo->commit();
    echo json_encode(["message" => "Booking registered successfully!"]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["message" => "Database Error: " . $e->getMessage()]);
}
