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
            <h1>⏳ Commande en attente</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $order->user->name }}</strong>,</p>
            <p>Nous avons bien reçu votre commande. Elle est en attente de validation par notre équipe.</p>

            <div class="info-box">
                <p><strong>Référence :</strong> {{ $order->reference }}</p>
                <p><strong>Montant :</strong> {{ number_format($order->amount, 0, ',', ' ') }} Ar</p>
                <p><strong>Instrumentale :</strong> {{ $order->instrumental->title ?? 'Pack' }}</p>
            </div>

            <p>Dès que votre paiement sera vérifié, vous recevrez un nouvel email avec l'accès à vos fichiers.</p>
        </div>
        <div class="footer">
            © {{ date('Y') }} Instrunaka
        </div>
    </div>
</body>
</html>