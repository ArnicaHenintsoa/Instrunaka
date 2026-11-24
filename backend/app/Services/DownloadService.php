<?php

namespace App\Services;

use App\Exceptions\DownloadException;
use App\Exceptions\UnauthorizedOrderActionException;
use App\Models\Download;
use App\Models\InstrumentalFile;
use App\Models\Order;
use App\Models\User;

class DownloadService
{
    public function prepareDownload(User $user, Order $order, string $fileType, ?int $instrumentalId = null): InstrumentalFile
    {
        if ($order->user_id !== $user->id) {
            throw new UnauthorizedOrderActionException('Cette commande ne vous appartient pas.');
        }

        if (! $order->isValidated()) {
            throw new DownloadException('Cette commande n\'est pas encore validée.');
        }

        if (! in_array($fileType, ['mp3', 'wav'], true)) {
            throw new DownloadException('Type de fichier invalide.');
        }

       
        if ($order->isPack()) {
            if (!$instrumentalId) {
                throw new DownloadException('instrumental_id est requis pour une commande pack.');
            }

            $item = $order->items()->where('instrumental_id', $instrumentalId)->first();
            if (!$item) {
                throw new DownloadException('Cette instrumentale ne fait pas partie de la commande.');
            }

            $file = $item->instrumental->files()->where('type', $fileType)->first();
        } else {
            $file = $order->instrumental->files()->where('type', $fileType)->first();
        }

        if (! $file) {
            throw new DownloadException('Fichier indisponible pour cette instrumentale.');
        }

        return $file;
    }

    public function recordDownload(
        User $user,
        Order $order,
        InstrumentalFile $file,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): Download {
        return Download::create([
            'user_id'              => $user->id,
            'order_id'             => $order->id,
            'instrumental_file_id' => $file->id,
            'file_type'            => $file->type,
            'ip_address'           => $ipAddress,
            'user_agent'           => $userAgent,
        ]);
    }

    public function resolvePath(InstrumentalFile $file): string
    {
        if ($this->isExternal($file)) {
            throw new DownloadException('Fichier externe non autorisé.');
        }
        return $file->path;
    }

    public function isExternal(InstrumentalFile $file): bool
    {
        return str_starts_with($file->path, 'http');
    }
}