<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; color: #333; }
        .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .info-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Commande validée !</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $order->user->name }}</strong>,</p>
            <p>Excellente nouvelle ! Votre commande a été validée. Vous pouvez maintenant télécharger vos fichiers.</p>

            <div class="info-box">
                <p><strong>Référence :</strong> {{ $order->reference }}</p>
                <p><strong>Instrumentale :</strong> {{ $order->instrumental->title ?? 'Pack' }}</p>
                <p><strong>Fichiers inclus :</strong> MP3 + WAV</p>
            </div>

            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/mes-achats" class="button">Accéder à mes achats</a>
        </div>
        <div class="footer">
            © {{ date('Y') }} Instrunaka
        </div>
    </div>
</body>
</html>