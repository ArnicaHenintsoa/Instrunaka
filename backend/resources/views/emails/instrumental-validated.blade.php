<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: {{ $approved ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)' }}; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; color: #333; }
        .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $approved ? '🎵 Instrumentale publiée !' : '❌ Instrumentale refusée' }}</h1>
        </div>
        <div class="content">
            <p>Bonjour,</p>
            @if($approved)
                <p>Bonne nouvelle ! Votre instrumentale <strong>{{ $instrumental->title }}</strong> a été validée et est maintenant visible dans notre catalogue.</p>
                <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/instrumentales/{{ $instrumental->id }}" class="button">Voir ma publication</a>
            @else
                <p>Nous sommes désolés, mais votre instrumentale <strong>{{ $instrumental->title }}</strong> n'a pas été retenue.</p>
                @if($reason)
                    <p><strong>Raison :</strong> {{ $reason }}</p>
                @endif
            @endif
        </div>
        <div class="footer">
            © {{ date('Y') }} Instrunaka
        </div>
    </div>
</body>
</html>