<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 30px; color: #333; }
        .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Vous êtes producteur !</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $producerRequest->user->name }}</strong>,</p>
            <p>Félicitations ! Votre demande pour devenir producteur a été <strong>approuvée</strong> par notre équipe.</p>
            <p>Vous pouvez dès maintenant soumettre vos instrumentales au catalogue.</p>
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/profil/soumettre" class="button">Soumettre une instrumentale</a>
        </div>
        <div class="footer">
            © {{ date('Y') }} Instrunaka
        </div>
    </div>
</body>
</html>