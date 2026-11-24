<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\DownloadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DownloadController extends Controller
{
    public function __construct(
        private readonly DownloadService $downloadService
    ) {}

    public function download(Request $request, int $orderId, string $fileType)
    {
        $order = Order::with(['instrumental.files', 'items.instrumental.files'])->findOrFail($orderId);
        $user = $request->user();
        $instrumentalId = $request->integer('instrumental_id') ?: null;

        $file = $this->downloadService->prepareDownload($user, $order, $fileType, $instrumentalId);

        $this->downloadService->recordDownload(
            $user,
            $order,
            $file,
            $request->ip(),
            $request->userAgent()
        );

        if ($this->downloadService->isExternal($file)) {
            return redirect($file->path);
        }

        $relativePath = $this->downloadService->resolvePath($file);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('local');

        abort_unless($disk->exists($relativePath), 404, 'Fichier introuvable.');

        // Nom de téléchargement
        $title = $order->isPack()
            ? ($instrumentalId ? $order->items()->where('instrumental_id', $instrumentalId)->first()?->instrumental->title : 'pack')
            : $order->instrumental->title;

        $filename = sprintf('%s.%s', str($title)->slug(), $fileType);

        return $disk->download($relativePath, $filename, [
            'Content-Type' => $file->mime_type ?? 'audio/mpeg',
        ]);
    }
}