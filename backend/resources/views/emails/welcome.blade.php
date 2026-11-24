<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; color: #333; }
        .content h2 { color: #7c3aed; }
        .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Bienvenue sur Instrunaka !</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{ $user->name }},</h2>
            <p>Nous sommes ravis de vous accueillir sur <strong>Instrunaka</strong>, votre plateforme de découverte et d'achat d'instrumentales de qualité.</p>
            <p>Avec votre compte, vous pouvez :</p>
            <ul>
                <li>🎧 Écouter des previews</li>
                <li>💾 Acheter et télécharger des instrumentales</li>
                <li>⭐ Gérer vos favoris et playlists</li>
                <li>🎵 Suivre vos producteurs préférés</li>
            </ul>
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/catalogue" class="button">Explorer le catalogue</a>
        </div>
        <div class="footer">
            © {{ date('Y') }} Instrunaka. Tous droits réservés.
        </div>
    </div>
</body>
</html>