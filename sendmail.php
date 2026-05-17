<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require 'vendor/autoload.php';

/**
 * Load .env from ONE directory above /htdocs
 * Adjust if your structure is different
 */
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

header('Content-Type: text/plain; charset=utf-8');

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    exit("Keine Daten empfangen.");
}

// ---------------------------
// Basic validation + cleanup
// ---------------------------
$name    = trim($data['name'] ?? '');
$org     = trim($data['org'] ?? '');
$contact = trim($data['contact'] ?? '');
$loc     = trim($data['loc'] ?? '');
$type    = trim($data['type'] ?? '');
$area    = trim($data['area'] ?? '');
$msg     = trim($data['msg'] ?? '');

// Required field check
if (!$name || !$contact || !$msg) {
    http_response_code(400);
    exit("Bitte fülle alle Pflichtfelder aus.");
}

// Very basic email validation (if contact is email)
if (!filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit("Ungültige E-Mail-Adresse.");
}

// ---------------------------
// PHPMailer setup
// ---------------------------
$mail = new PHPMailer(true);

try {

    // SMTP config (Strato)
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];

    // IMPORTANT: correct for port 465
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = (int) $_ENV['SMTP_PORT'];

    // Sender / recipient
    $mail->setFrom($_ENV['SMTP_FROM'], 'Website Formular');
    $mail->addAddress($_ENV['SMTP_FROM']);

    // Reply-to user
    $mail->addReplyTo($contact, $name);

    // Subject
    $mail->Subject = "Neue Projektanfrage von $name";

    // Body (plain text)
    $mail->Body =
        "Neue Anfrage über das Kontaktformular\n\n" .
        "Name: $name\n" .
        "Organisation: $org\n" .
        "Kontakt: $contact\n" .
        "Ort: $loc\n" .
        "Projektart: $type\n" .
        "Fläche: $area\n\n" .
        "Nachricht:\n$msg\n";

    $mail->send();

    echo "Nachricht erfolgreich gesendet!";

} catch (Exception $e) {

    // Log error internally, don't expose details to user
    error_log("Mail error: " . $mail->ErrorInfo);

    http_response_code(500);
    echo "Fehler beim Senden der Nachricht.";
}