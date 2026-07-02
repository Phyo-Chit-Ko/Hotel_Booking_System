<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$host = 'localhost';
$db   = 'hotel-management';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Start Transaction
    $pdo->beginTransaction();

    // 1. Insert into Guests table
    $sqlGuest = "INSERT INTO guests (first_name, last_name, email, phone, nationality) 
                 VALUES (:fname, :lname, :email, :phone, :nat)";
    $stmtG = $pdo->prepare($sqlGuest);
    $stmtG->execute([
        ':fname' => $data['first_name'],
        ':lname' => $data['last_name'],
        ':email' => $data['email'],
        ':phone' => $data['phone'],
        ':nat'   => $data['nationality']
    ]);

    $guest_id = $pdo->lastInsertId();

    // 2. Insert into Bookings table using the new guest_id
    $sqlBooking = "INSERT INTO bookings (guest_id, room_type_id, check_in_date, check_out_date, total_room, adult, child, status, created_at) 
                   VALUES (:g_id, :room_id, :check_in, :check_out, :rooms, :adult, :child, :status, NOW())";

    $stmtB = $pdo->prepare($sqlBooking);
    $stmtB->execute([
        ':g_id'      => $guest_id,
        ':room_id'   => $data['room_type_id'],
        ':check_in'  => $data['check_in_date'],
        ':check_out' => $data['check_out_date'],
        ':rooms'     => $data['total_room'],
        ':adult'     => $data['adult'],
        ':child'     => $data['child'],
        ':status'    => 'pending'
    ]);

    $pdo->commit();
    echo json_encode(["message" => "Booking and Guest registered successfully!"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
