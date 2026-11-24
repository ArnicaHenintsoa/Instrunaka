<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; color: #333; }
        .info-box { background: #f9f5ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📩 Nouveau message de contact</h1>
        </div>
        <div class="content">
            <div class="info-box">
                <p><strong>Nom :</strong> {{ $contactMessage->name }}</p>
                <p><strong>Email :</strong> {{ $contactMessage->email }}</p>
                @if($contactMessage->subject)
                    <p><strong>Sujet :</strong> {{ $contactMessage->subject }}</p>
                @endif
            </div>

            <h3>Message :</h3>
            <p style="white-space: pre-wrap;">{{ $contactMessage->message }}</p>
        </div>
        <div class="footer">
            © {{ date('Y') }} Instrunaka
        </div>
    </div>
</body>
</html>