<?php

require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


$dataFile = 'submissions.json';


function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}


$errors = [];


$firstName = isset($_POST['first_name']) ? sanitize($_POST['first_name']) : '';
$lastName = isset($_POST['last_name']) ? sanitize($_POST['last_name']) : '';
$email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? sanitize($_POST['phone']) : '';
$message = isset($_POST['message']) ? sanitize($_POST['message']) : '';
$agree = isset($_POST['agree']) ? $_POST['agree'] : '';


if (empty($firstName)) $errors[] = 'First name is required.';
if (empty($lastName)) $errors[] = 'Last name is required.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email is required.';
if (!empty($phone) && !preg_match('/^\+\d{9,15}$/', $phone)) $errors[] = 'A valid phone number is required.';
if (empty($message)) $errors[] = 'Message is required.';
if ($agree !== 'yes') $errors[] = 'You must agree to the terms.';


if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'errors' => $errors]);
    exit;
}
$id = uniqid();


$submission = [
    'id'         => $id,
    'first_name' => $firstName,
    'last_name'  => $lastName,
    'email'      => $email,
    'phone'      => $phone,
    'message'    => $message,
    'timestamp'  => date('Y-m-d H:i:s')
];


if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $submissions = json_decode($jsonData, true);
    if (!is_array($submissions)) $submissions = [];
} else {
    $submissions = [];
}


$submissions[] = $submission;


file_put_contents($dataFile, json_encode($submissions, JSON_PRETTY_PRINT));


$mail = new PHPMailer(true);
try {
    
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'noreply@gmail.com';  // Gmail from which the automatic mail sent
    $mail->Password = 'email app password';           // email app password should be entered
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;


    $mail->setFrom('noreply@gmail.com', 'LOGOIPSUM');
    $mail->addAddress($email, $firstName . ' ' . $lastName);
    $mail->Subject = 'Thank you for contacting us';
    $mail->Body = "Dear $firstName,\n\nThank you for reaching out. We have received your message:\n\n\"$message\"\n\nWe will get back to you shortly.\n\nBest regards,\nLOGOIPSUM Team";
    $mail->send();

   
    $mail->clearAddresses();
    $mail->addAddress('admin1@gmail.com');
    $mail->addAddress('admin2@gmail.com'); //admin emails which receive a copy of the submission
    $mail->Subject = 'New Form Submission';
    $mail->Body = "New submission received:\n\nID: $id\nName: $firstName $lastName\nEmail: $email\nPhone: $phone\nMessage: $message\nTimestamp: " . $submission['timestamp'];
    $mail->send();

    echo json_encode(['status' => 'success', 'message' => 'Form submitted successfully.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'errors' => ['Email could not be sent. ' . $mail->ErrorInfo]]);
}


?>
