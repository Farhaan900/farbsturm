<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header('Content-Type: text/plain; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    exit("Keine Daten empfangen.");
}

$name = htmlspecialchars($data['name'] ?? '');
$org = htmlspecialchars($data['org'] ?? '');
$contact = htmlspecialchars($data['contact'] ?? '');
$loc = htmlspecialchars($data['loc'] ?? '');
$type = htmlspecialchars($data['type'] ?? '');
$area = htmlspecialchars($data['area'] ?? '');
$msg = htmlspecialchars($data['msg'] ?? '');

$mail = new PHPMailer(true);

try {

    $mail->isSMTP();
    $mail->Host = getenv('SMTP_HOST');
    $mail->SMTPAuth = true;

    $mail->Username = getenv('SMTP_USER');
    $mail->Password = getenv('SMTP_PASS');

    $mail->Port = (int) getenv('SMTP_PORT');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->setFrom(getenv('SMTP_FROM'), 'Website Formular');

    $mail->addAddress(getenv('SMTP_FROM'));

    $mail->addReplyTo($contact, $name);

    $mail->Subject = "Neue Projektanfrage von $name";

    $mail->Body = "
Name: $name

Organisation: $org

Kontakt: $contact

Ort: $loc

Projektart: $type

Flache: $area

Nachricht:
$msg
";

    $mail->send();

    echo "Nachricht erfolgreich gesendet!";

} catch (Exception $e) {

    http_response_code(500);
    echo "Mailer Error: " . $mail->ErrorInfo;
}
?>