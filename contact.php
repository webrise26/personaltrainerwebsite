<?php
/**
 * Secure Contact Form Handler — Federico Guerreschi PT
 * Protezione: XSS, CSRF, Rate Limiting, Honeypot, Validazione input
 * Requisiti: PHP 7.4+, estensione mail o SMTP (PHPMailer consigliato)
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

// ── Configurazione ───────────────────────────────────────────────────────────
const RECIPIENT_EMAIL  = 'info@federicoguerreschi.it';
const RECIPIENT_NAME   = 'Federico Guerreschi';
const SITE_NAME        = 'federicoguerreschi.it';
const RATE_LIMIT_MAX   = 3;          // max invii per IP per ora
const RATE_LIMIT_WINDOW = 3600;      // finestra in secondi (1 ora)

// ── Helper: risposta JSON ────────────────────────────────────────────────────
function respond(bool $ok, string $message, int $code = 200): never {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

// ── Solo POST ────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', 405);
}

// ── Origin check (CORS rudimentale) ─────────────────────────────────────────
$allowed_origins = ['https://federicoguerreschi.it', 'https://www.federicoguerreschi.it'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowed_origins, true)) {
    respond(false, 'Forbidden', 403);
}

// ── Rate Limiting via sessione/file ──────────────────────────────────────────
session_start();
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
$ip_hash = hash('sha256', $ip);  // non loggare IP raw

$rate_key = 'rl_' . $ip_hash;
$now = time();
$submissions = $_SESSION[$rate_key] ?? [];
$submissions = array_filter($submissions, fn($t) => $t > $now - RATE_LIMIT_WINDOW);

if (count($submissions) >= RATE_LIMIT_MAX) {
    respond(false, 'Troppi tentativi. Riprova tra un\'ora.', 429);
}

// ── CSRF Token ───────────────────────────────────────────────────────────────
// Il token viene generato e validato tramite sessione
if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token'])) {
    respond(false, 'Token non valido', 403);
}
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    respond(false, 'Token non valido', 403);
}

// ── Honeypot anti-bot ────────────────────────────────────────────────────────
if (!empty($_POST['website'])) {
    // Bot detected — risposta falso-positiva per non rivelare la trap
    respond(true, 'Messaggio inviato con successo!');
}

// ── Sanitizzazione & Validazione input ──────────────────────────────────────

/**
 * Sanitizza una stringa contro XSS e injection.
 * NON usare addslashes — usa htmlspecialchars per output HTML.
 */
function sanitize_text(string $input, int $max_len = 255): string {
    $clean = trim($input);
    $clean = strip_tags($clean);                                   // rimuovi HTML
    $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $clean); // ctrl chars
    return mb_substr($clean, 0, $max_len, 'UTF-8');
}

function sanitize_email(string $input): string {
    return filter_var(trim($input), FILTER_SANITIZE_EMAIL);
}

// Raccolta e pulizia
$name    = sanitize_text($_POST['name']    ?? '', 60);
$email   = sanitize_email($_POST['email'] ?? '');
$phone   = sanitize_text($_POST['phone']  ?? '', 20);
$goal    = sanitize_text($_POST['goal']   ?? '', 50);
$message = sanitize_text($_POST['message'] ?? '', 1000);
$gdpr    = !empty($_POST['gdpr_consent']);

// Validazioni
$errors = [];

if (strlen($name) < 2 || !preg_match('/^[a-zA-ZÀ-ÿ\s\'\-]{2,60}$/u', $name)) {
    $errors[] = 'Nome non valido (2-60 caratteri, solo lettere).';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
    $errors[] = 'Email non valida.';
}

if (!empty($phone) && !preg_match('/^[\+]?[\d\s\-\(\)]{7,20}$/', $phone)) {
    $errors[] = 'Numero di telefono non valido.';
}

if (strlen($message) < 10) {
    $errors[] = 'Il messaggio è troppo corto (minimo 10 caratteri).';
}

if (!$gdpr) {
    $errors[] = 'Devi accettare la Privacy Policy per inviare il messaggio.';
}

// Whitelist obiettivi validi
$valid_goals = ['dimagrimento','massa','atletica','riatleti','online','giovani','assessment',''];
if (!in_array($goal, $valid_goals, true)) {
    $goal = '';
}

if (!empty($errors)) {
    respond(false, implode(' ', $errors), 422);
}

// ── Invio email sicuro ───────────────────────────────────────────────────────
// Usa PHPMailer in produzione: composer require phpmailer/phpmailer
// Di seguito versione mail() nativa come fallback

$goal_labels = [
    'dimagrimento' => 'Dimagrimento & Ricomposizione',
    'massa'        => 'Aumento massa muscolare',
    'atletica'     => 'Preparazione atletica',
    'riatleti'     => 'Riatletizzazione post-infortunio',
    'online'       => 'Coaching online',
    'giovani'      => 'Sviluppo giovane atleta',
    'assessment'   => 'Assessment iniziale',
    ''             => 'Non specificato',
];

$goal_label = $goal_labels[$goal] ?? 'Non specificato';
$date       = date('d/m/Y H:i');

// Corpo email (PLAIN TEXT — mai HTML non filtrato)
$body = <<<EOT
Nuovo messaggio da federicoguerreschi.it — $date

━━━━━━━━━━━━━━━━━━━━━━━━━━
DATI CONTATTO
━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome:      $name
Email:     $email
Telefono:  $phone
Obiettivo: $goal_label

━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGGIO
━━━━━━━━━━━━━━━━━━━━━━━━━━
$message

━━━━━━━━━━━━━━━━━━━━━━━━━━
Consenso GDPR: Sì — $date
IP hash: $ip_hash
EOT;

// Header email — NO user-supplied values nei From/Reply-To senza validazione
$headers  = "From: noreply@" . SITE_NAME . "\r\n";
$headers .= "Reply-To: " . RECIPIENT_EMAIL . "\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$subject = "[FG-PT] Nuovo contatto da $name — $goal_label";

$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

// Email di conferma all'utente
if ($sent) {
    $confirm_body = "Ciao $name,\n\nho ricevuto il tuo messaggio e ti risponderò entro 24 ore.\n\nFederico Guerreschi\nPersonal Trainer & Preparatore Atletico\nhttps://federicoguerreschi.it";
    mail($email, "Messaggio ricevuto — Federico Guerreschi PT", $confirm_body,
        "From: " . RECIPIENT_EMAIL . "\r\nContent-Type: text/plain; charset=UTF-8\r\n");
}

// ── Rate limit: registra questo invio ───────────────────────────────────────
$submissions[] = $now;
$_SESSION[$rate_key] = $submissions;

// ── Rigenera CSRF token ──────────────────────────────────────────────────────
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

if ($sent) {
    respond(true, 'Messaggio inviato! Ti risponderò entro 24 ore.');
} else {
    respond(false, 'Errore nell\'invio. Scrivimi direttamente a info@federicoguerreschi.it.', 500);
}
