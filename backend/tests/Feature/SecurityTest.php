<?php

namespace Tests\Feature;

use App\Models\Instrumental;
use App\Models\InstrumentalFile;
use App\Models\Order;
use App\Models\Producer;
use App\Models\PromoCode;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles
        Role::create(['name' => 'user',    'label' => 'Utilisateur']);
        Role::create(['name' => 'admin',   'label' => 'Administrateur']);
        Role::create(['name' => 'producer','label' => 'Producteur']);

        // Créer les disques fake
        Storage::fake('local');
        Storage::fake('public');
    }

    private function createUser(string $status = 'active', string $role = 'user'): User
    {
        $roleModel = Role::where('name', $role)->first();
        return User::factory()->create([
            'role_id' => $roleModel->id,
            'status'  => $status,
        ]);
    }

    private function createInstrumentalWithFiles(): Instrumental
    {
        $producerUser = $this->createUser('active', 'producer');
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        $instrumental = Instrumental::factory()->create([
            'producer_id' => $producer->id,
            'status'      => 'available',
        ]);

        // Créer les fichiers (mp3, wav, preview)
        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'mp3',
            'path'            => "audio/{$instrumental->id}/test.mp3",
            'original_name'   => 'test.mp3',
            'size_bytes'      => 1000000,
            'mime_type'       => 'audio/mpeg',
        ]);

        Storage::disk('local')->put("audio/{$instrumental->id}/test.mp3", 'fake content');

        return $instrumental;
    }

    /** TEST 1 : Téléchargement refusé si commande non validée */
    public function test_download_refused_if_order_not_validated(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumentalWithFiles();
        $order = Order::factory()->create([
            'user_id'         => $user->id,
            'instrumental_id' => $instrumental->id,
            'status'          => 'pending',
        ]);

        $response = $this->actingAs($user)->getJson("/api/downloads/{$order->id}/mp3");

        $response->assertStatus(400); // DownloadException
        $response->assertJson(['message' => "Cette commande n'est pas encore validée."]);
    }

    /** TEST 2 : Téléchargement refusé à un autre utilisateur */
    public function test_download_refused_to_another_user(): void
    {
        $owner = $this->createUser();
        $attacker = $this->createUser();
        $instrumental = $this->createInstrumentalWithFiles();
        $order = Order::factory()->validated()->create([
            'user_id'         => $owner->id,
            'instrumental_id' => $instrumental->id,
        ]);

        $response = $this->actingAs($attacker)->getJson("/api/downloads/{$order->id}/mp3");

        $response->assertStatus(403); // UnauthorizedOrderActionException
    }

    /** TEST 3 : Validation non exclusive refusée après vente exclusive */
    public function test_non_exclusive_validation_refused_after_exclusive_sale(): void
    {
        $admin = $this->createUser('active', 'admin');
        $buyer1 = $this->createUser();
        $buyer2 = $this->createUser();
        $instrumental = $this->createInstrumentalWithFiles();

        // Commande 1 (non exclusive) en pending
        $order1 = Order::factory()->create([
            'user_id'         => $buyer1->id,
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
        ]);

        // Commande 2 (exclusive) validée → instrumentale devient sold_exclusive
        $order2 = Order::factory()->exclusive()->create([
            'user_id'         => $buyer2->id,
            'instrumental_id' => $instrumental->id,
        ]);
        $instrumental->update(['status' => 'sold_exclusive']);

        // L'admin essaie de valider order1 → doit échouer
        $response = $this->actingAs($admin)->postJson("/api/admin/orders/{$order1->id}/validate", [
            'sender_reference' => '123456789',
            'received_amount'  => 7000,
        ]);

        $response->assertStatus(422);
    }

    /** TEST 4 : Double validation impossible */
    public function test_double_validation_impossible(): void
    {
        $admin = $this->createUser('active', 'admin');
        $buyer = $this->createUser();
        $instrumental = $this->createInstrumentalWithFiles();
        $order = Order::factory()->create([
            'user_id'         => $buyer->id,
            'instrumental_id' => $instrumental->id,
        ]);

        // Première validation OK
        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/validate", [
            'sender_reference' => '123456789',
            'received_amount'  => 7000,
        ])->assertStatus(200);

        // Deuxième validation → erreur
        $response = $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/validate", [
            'sender_reference' => '987654321',
            'received_amount'  => 7000,
        ]);

       $response->assertStatus(422); // OrderException
    }

    /** TEST 5 : Deux commandes exclusives concurrentes → une seule passe */
    public function test_two_exclusive_orders_only_one_validated(): void
    {
        $admin = $this->createUser('active', 'admin');
        $buyer1 = $this->createUser();
        $buyer2 = $this->createUser();
        $instrumental = $this->createInstrumentalWithFiles();

        $order1 = Order::factory()->exclusive()->create([
            'user_id'         => $buyer1->id,
            'instrumental_id' => $instrumental->id,
        ]);
        $order2 = Order::factory()->exclusive()->create([
            'user_id'         => $buyer2->id,
            'instrumental_id' => $instrumental->id,
        ]);

        // Valider order1
        $this->actingAs($admin)->postJson("/api/admin/orders/{$order1->id}/validate", [
            'sender_reference' => '111111',
            'received_amount'  => 20000,
        ])->assertStatus(200);

        // Valider order2 → doit échouer
        $response = $this->actingAs($admin)->postJson("/api/admin/orders/{$order2->id}/validate", [
            'sender_reference' => '222222',
            'received_amount'  => 20000,
        ]);

        $response->assertStatus(422);
    }

    /** TEST 6 : Code promo appliqué côté serveur */
    public function test_promo_code_applied_server_side(): void
    {
        $user = $this->createUser();
        $instrumental = $this->createInstrumentalWithFiles();

        PromoCode::create([
            'code'             => 'WELCOME10',
            'discount_percent' => 10,
            'max_uses'         => 100,
            'used_count'       => 0,
            'is_active'        => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'instrumental_id' => $instrumental->id,
            'type'            => 'non_exclusive',
            'promo_code'      => 'WELCOME10',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('payment.amount', 6300); // 7000 - 10%
    }

    /** TEST 7 : Compte suspendu bloqué */
    public function test_suspended_user_blocked(): void
    {
        $user = $this->createUser('suspended');

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => 'Votre compte a été suspendu. Veuillez contacter l\'administration.']);
    }

    /** TEST 8 : Accès public aux MP3/WAV refusé */
    public function test_public_mp3_access_refused(): void
    {
        $instrumental = $this->createInstrumentalWithFiles();

        // Essai d'accès direct au fichier via FileController
        $response = $this->getJson("/api/files/audio/{$instrumental->id}/test.mp3");

        $response->assertStatus(403);
    }
}