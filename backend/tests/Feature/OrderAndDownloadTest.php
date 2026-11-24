<?php

namespace Tests\Feature;

use App\Models\Instrumental;
use App\Models\InstrumentalFile;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Pack;
use App\Models\Producer;
use App\Models\PromoCode;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderAndDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Rôles
        Role::create(['name' => 'user',     'label' => 'Utilisateur']);
        Role::create(['name' => 'admin',    'label' => 'Administrateur']);
        Role::create(['name' => 'producer', 'label' => 'Producteur']);

        // Disques fake
        Storage::fake('local');
        Storage::fake('public');

        // Config plateforme
        Config::set('platform.prices.non_exclusive', 7000);
        Config::set('platform.prices.exclusive', 20000);
        Config::set('platform.features.packs_enabled', true);
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private function createUser(string $status = 'active', string $role = 'user'): User
    {
        $roleModel = Role::where('name', $role)->first();
        return User::factory()->create([
            'role_id' => $roleModel->id,
            'status'  => $status,
        ]);
    }

    private function createProducer(): Producer
    {
        $user = $this->createUser('active', 'producer');
        return Producer::factory()->create(['user_id' => $user->id]);
    }

    private function createInstrumental(int $nonExclusive = 10000, int $exclusive = 25000): Instrumental
    {
        $producer = $this->createProducer();
        return Instrumental::factory()->create([
            'producer_id'         => $producer->id,
            'status'              => 'available',
            'non_exclusive_price' => $nonExclusive,
            'exclusive_price'     => $exclusive,
        ]);
    }

    private function attachAudioFiles(Instrumental $instrumental): void
    {
        // MP3 privé
        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'mp3',
            'path'            => "audio/{$instrumental->id}/test.mp3",
            'original_name'   => 'test.mp3',
            'size_bytes'      => 1000,
            'mime_type'       => 'audio/mpeg',
        ]);
        Storage::disk('local')->put("audio/{$instrumental->id}/test.mp3", 'fake');

        // WAV privé
        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'wav',
            'path'            => "audio/{$instrumental->id}/test.wav",
            'original_name'   => 'test.wav',
            'size_bytes'      => 2000,
            'mime_type'       => 'audio/wav',
        ]);
        Storage::disk('local')->put("audio/{$instrumental->id}/test.wav", 'fake');

        // Preview public
        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'preview',
            'path'            => "previews/{$instrumental->id}/test.mp3",
            'original_name'   => 'test.mp3',
            'size_bytes'      => 500,
            'mime_type'       => 'audio/mpeg',
        ]);
        Storage::disk('public')->put("previews/{$instrumental->id}/test.mp3", 'fake');
    }

    // ─────────────────────────────────────────────
    // 1. PRIX FACTURÉ
    // ─────────────────────────────────────────────

    /** La commande non exclusive utilise le prix de l'instrumentale, pas la config. */
    public function test_non_exclusive_order_uses_instrumental_price(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental(10000, 25000);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('payment.amount', 10000);
    }

    /** La commande exclusive utilise le prix de l'instrumentale. */
    public function test_exclusive_order_uses_instrumental_price(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental(10000, 25000);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'instrumental_id' => $instrumental->id,
            'type'            => 'exclusive',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('payment.amount', 25000);
    }

    // ─────────────────────────────────────────────
    // 2. CODE PROMO
    // ─────────────────────────────────────────────

    /** Un code promo de 20 % est appliqué et le compteur augmente. */
    public function test_promo_code_discount_and_counter(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental(10000, 25000);

        $promo = PromoCode::create([
            'code'             => 'WELCOME20',
            'discount_percent' => 20,
            'max_uses'         => 100,
            'used_count'       => 0,
            'is_active'        => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
            'promo_code'      => 'WELCOME20',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('payment.amount', 8000); // 10000 - 20%
        $this->assertEquals(1, $promo->fresh()->used_count);
    }

    /** Le compteur du code promo est restitué quand la commande est annulée. */
    public function test_promo_code_released_on_cancel(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental(10000, 25000);
        $this->attachAudioFiles($instrumental);

        $promo = PromoCode::create([
            'code'             => 'WELCOME20',
            'discount_percent' => 20,
            'max_uses'         => 100,
            'used_count'       => 0,
            'is_active'        => true,
        ]);

        $order = $this->actingAs($user)->postJson('/api/orders', [
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
            'promo_code'      => 'WELCOME20',
        ])->json('data');

        $this->assertEquals(1, $promo->fresh()->used_count);

        $this->actingAs($user)->postJson("/api/orders/{$order['id']}/cancel")->assertStatus(200);

        $this->assertEquals(0, $promo->fresh()->used_count);
    }

    /** Le compteur du code promo est restitué quand l'admin refuse la commande. */
    public function test_promo_code_released_on_reject(): void
    {
        $user = $this->createUser();
        $admin = $this->createUser('active', 'admin');
        $instrumental = $this->createInstrumental(10000, 25000);
        $this->attachAudioFiles($instrumental);

        $promo = PromoCode::create([
            'code'             => 'WELCOME20',
            'discount_percent' => 20,
            'max_uses'         => 100,
            'used_count'       => 0,
            'is_active'        => true,
        ]);

        $order = $this->actingAs($user)->postJson('/api/orders', [
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
            'promo_code'      => 'WELCOME20',
        ])->json('data');

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order['id']}/reject", [
            'reason' => 'Paiement non reçu',
        ])->assertStatus(200);

        $this->assertEquals(0, $promo->fresh()->used_count);
    }

    // ─────────────────────────────────────────────
    // 3. UPLOAD PRODUCTEUR
    // ─────────────────────────────────────────────

    /** L'audio est stocké sur le disque 'local' et la preview sur 'public'. */
    public function test_producer_upload_stores_audio_privately_and_preview_publicly(): void
    {
        $user = $this->createUser('active', 'admin'); // admin pour éviter le blocage producteur

        $audio = \Illuminate\Http\UploadedFile::fake()->create('beat.mp3', 500, 'audio/mpeg');
        $preview = \Illuminate\Http\UploadedFile::fake()->create('preview.mp3', 100, 'audio/mpeg');
        $cover = \Illuminate\Http\UploadedFile::fake()->image('cover.jpg', 500, 500);

        $response = $this->actingAs($user)->postJson('/api/producer/instrumentals', [
            'title'            => 'Mon beat',
            'duration_seconds' => 180,
            'audio'            => $audio,
            'preview'          => $preview,
            'cover'            => $cover,
        ]);

        $response->assertStatus(201);
        $instrumentalId = $response->json('data.id');

        // Vérifie que l'audio est sur le disque local
        $audioFile = InstrumentalFile::where('instrumental_id', $instrumentalId)
            ->whereIn('type', ['mp3', 'wav'])
            ->first();
        $this->assertNotNull($audioFile);
        Storage::disk('local')->assertExists($audioFile->path);

        // Vérifie que la preview est sur le disque public
        $previewFile = InstrumentalFile::where('instrumental_id', $instrumentalId)
            ->where('type', 'preview')
            ->first();
        $this->assertNotNull($previewFile);
        Storage::disk('public')->assertExists($previewFile->path);
        $this->assertNotEquals($audioFile->path, $previewFile->path);

        // Vérifie que duration_seconds a bien été enregistré
        $this->assertEquals(180, Instrumental::find($instrumentalId)->duration_seconds);
    }

    /** Une requête sans preview doit être refusée. */
    public function test_producer_upload_without_preview_is_rejected(): void
    {
        $user = $this->createUser('active', 'admin');

        $audio = \Illuminate\Http\UploadedFile::fake()->create('beat.mp3', 500, 'audio/mpeg');

        $response = $this->actingAs($user)->postJson('/api/producer/instrumentals', [
            'title' => 'Sans preview',
            'audio' => $audio,
        ]);

        $response->assertStatus(422);
    }

    // ─────────────────────────────────────────────
    // 4. TÉLÉCHARGEMENT
    // ─────────────────────────────────────────────

    /** Un acheteur avec une commande validée peut télécharger le MP3. */
    public function test_validated_order_can_download_mp3(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental();
        $this->attachAudioFiles($instrumental);

        $order = Order::factory()->validated()->create([
            'user_id'         => $user->id,
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
        ]);

        $response = $this->actingAs($user)->getJson("/api/downloads/{$order->id}/mp3");

        $response->assertStatus(200);
    }

    /** Un acheteur sans commande validée ne peut pas télécharger. */
    public function test_pending_order_cannot_download(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental();
        $this->attachAudioFiles($instrumental);

        $order = Order::factory()->create([
            'user_id'         => $user->id,
            'instrumental_id' => $instrumental->id,
            'status'          => 'pending',
        ]);

        $response = $this->actingAs($user)->getJson("/api/downloads/{$order->id}/mp3");

        $response->assertStatus(400);
        $response->assertJson(['message' => "Cette commande n'est pas encore validée."]);
    }

    // ─────────────────────────────────────────────
    // 5. ADMIN : lecture des fichiers
    // ─────────────────────────────────────────────

    /** L'admin lit la preview sur le disque public. */
    public function test_admin_reads_preview_from_public_disk(): void
    {
        $admin = $this->createUser('active', 'admin');
        $instrumental = $this->createInstrumental();
        $this->attachAudioFiles($instrumental);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/instrumentals/{$instrumental->id}/preview-audio/preview");

        $response->assertStatus(200);
    }

    /** L'admin lit le MP3 sur le disque local. */
    public function test_admin_reads_mp3_from_local_disk(): void
    {
        $admin = $this->createUser('active', 'admin');
        $instrumental = $this->createInstrumental();
        $this->attachAudioFiles($instrumental);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/instrumentals/{$instrumental->id}/preview-audio/mp3");

        $response->assertStatus(200);
    }

    // ─────────────────────────────────────────────
    // 6. PLAYLISTS
    // ─────────────────────────────────────────────

    /** La page détail d'une playlist renvoie bien genre et mood. */
    public function test_playlist_detail_includes_genre_and_mood(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumental();
        $this->attachAudioFiles($instrumental);

        $playlist = $user->playlists()->create(['name' => 'Mes beats']);
        $playlist->instrumentals()->attach($instrumental->id);

        $response = $this->actingAs($user)->getJson("/api/playlists/{$playlist->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'instrumentals' => [
                    '*' => ['id', 'title', 'genre', 'mood'],
                ],
            ],
        ]);
    }
}