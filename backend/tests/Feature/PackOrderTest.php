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

class PackOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'user',     'label' => 'Utilisateur']);
        Role::create(['name' => 'admin',    'label' => 'Administrateur']);
        Role::create(['name' => 'producer', 'label' => 'Producteur']);

        Storage::fake('local');
        Storage::fake('public');

        Config::set('platform.prices.non_exclusive', 7000);
        Config::set('platform.prices.exclusive', 20000);
        Config::set('platform.features.packs_enabled', true);
    }

    private function createUser(string $status = 'active', string $role = 'user'): User
    {
        $roleModel = Role::where('name', $role)->first();
        return User::factory()->create([
            'role_id' => $roleModel->id,
            'status'  => $status,
        ]);
    }

    private function createInstrumental(int $price = 10000): Instrumental
    {
        $user = $this->createUser('active', 'producer');
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        $instrumental = Instrumental::factory()->create([
            'producer_id'         => $producer->id,
            'status'              => 'available',
            'non_exclusive_price' => $price,
            'exclusive_price'     => $price * 2,
        ]);

        // Fichiers audio
        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'mp3',
            'path'            => "audio/{$instrumental->id}/test.mp3",
            'original_name'   => 'test.mp3',
            'size_bytes'      => 1000,
            'mime_type'       => 'audio/mpeg',
        ]);
        Storage::disk('local')->put("audio/{$instrumental->id}/test.mp3", 'fake');

        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'preview',
            'path'            => "previews/{$instrumental->id}/test.mp3",
            'original_name'   => 'test.mp3',
            'size_bytes'      => 500,
            'mime_type'       => 'audio/mpeg',
        ]);
        Storage::disk('public')->put("previews/{$instrumental->id}/test.mp3", 'fake');

        return $instrumental;
    }

    // ─────────────────────────────────────────────
    // 1. CRÉATION COMMANDE PACK
    // ─────────────────────────────────────────────

    /** Une commande pack crée bien les order_items avec les bons prix. */
    public function test_pack_order_creates_order_items(): void
    {
        $user = $this->createUser();
        $inst1 = $this->createInstrumental(10000);
        $inst2 = $this->createInstrumental(15000);

        $pack = Pack::factory()->create([
            'price'  => 20000,
            'active' => true,
        ]);
        $pack->instrumentals()->attach([$inst1->id, $inst2->id]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'pack_id' => $pack->id,
            'type'    => 'pack',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('payment.amount', 20000);

        $orderId = $response->json('data.id');
        $order = Order::find($orderId);

        $this->assertEquals('pack', $order->type);
        $this->assertEquals($pack->id, $order->pack_id);
        $this->assertNull($order->instrumental_id);

        $this->assertCount(2, $order->items);
        $this->assertEquals(10000, $order->items->firstWhere('instrumental_id', $inst1->id)->price);
        $this->assertEquals(15000, $order->items->firstWhere('instrumental_id', $inst2->id)->price);
    }

    /** Une commande pack échoue si une des instrumentales n'est plus disponible. */
    public function test_pack_order_fails_if_instrumental_unavailable(): void
    {
        $user = $this->createUser();
        $inst1 = $this->createInstrumental(10000);
        $inst2 = $this->createInstrumental(15000);
        $inst2->update(['status' => 'sold_exclusive']);

        $pack = Pack::factory()->create([
            'price'  => 20000,
            'active' => true,
        ]);
        $pack->instrumentals()->attach([$inst1->id, $inst2->id]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'pack_id' => $pack->id,
            'type'    => 'pack',
        ]);

        $response->assertStatus(422);
    }

    // ─────────────────────────────────────────────
    // 2. PROMO SUR PACK
    // ─────────────────────────────────────────────

    /** Un code promo s'applique sur le prix du pack. */
    public function test_promo_code_applied_on_pack(): void
    {
        $user = $this->createUser();
        $inst1 = $this->createInstrumental(10000);
        $inst2 = $this->createInstrumental(15000);

        $pack = Pack::factory()->create([
            'price'  => 20000,
            'active' => true,
        ]);
        $pack->instrumentals()->attach([$inst1->id, $inst2->id]);

        $promo = PromoCode::create([
            'code'             => 'PACK10',
            'discount_percent' => 10,
            'max_uses'         => 100,
            'used_count'       => 0,
            'is_active'        => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'pack_id'    => $pack->id,
            'type'       => 'pack',
            'promo_code' => 'PACK10',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('payment.amount', 18000); // 20000 - 10%
        $this->assertEquals(1, $promo->fresh()->used_count);
    }

    // ─────────────────────────────────────────────
    // 3. TÉLÉCHARGEMENT D'UN BEAT DU PACK
    // ─────────────────────────────────────────────

    /** Un acheteur d'un pack validé peut télécharger un beat en passant instrumental_id. */
    public function test_download_beat_from_validated_pack(): void
    {
        $user = $this->createUser();
        $inst1 = $this->createInstrumental(10000);
        $inst2 = $this->createInstrumental(15000);

        $pack = Pack::factory()->create(['price' => 20000, 'active' => true]);
        $pack->instrumentals()->attach([$inst1->id, $inst2->id]);

        $order = Order::factory()->validated()->create([
            'user_id'         => $user->id,
            'pack_id'         => $pack->id,
            'instrumental_id' => null,
            'type'            => 'pack',
        ]);

        OrderItem::factory()->create([
            'order_id'        => $order->id,
            'instrumental_id' => $inst1->id,
            'price'           => 10000,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/downloads/{$order->id}/mp3?instrumental_id={$inst1->id}");

        $response->assertStatus(200);
    }

    /** Le téléchargement d'un beat d'un pack est refusé si la commande n'est pas validée. */
    public function test_download_beat_from_pending_pack_is_refused(): void
    {
        $user = $this->createUser();
        $inst1 = $this->createInstrumental(10000);

        $pack = Pack::factory()->create(['price' => 10000, 'active' => true]);
        $pack->instrumentals()->attach([$inst1->id]);

        $order = Order::factory()->create([
            'user_id'         => $user->id,
            'pack_id'         => $pack->id,
            'instrumental_id' => null,
            'type'            => 'pack',
            'status'          => 'pending',
        ]);

        OrderItem::factory()->create([
            'order_id'        => $order->id,
            'instrumental_id' => $inst1->id,
            'price'           => 10000,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/downloads/{$order->id}/mp3?instrumental_id={$inst1->id}");

        $response->assertStatus(400);
        $response->assertJson(['message' => "Cette commande n'est pas encore validée."]);
    }
}