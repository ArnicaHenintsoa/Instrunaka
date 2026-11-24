<?php

namespace App\Http\Requests;

use App\Services\OrderService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isPack = $this->input('type') === 'pack';

        return [
            
            'instrumental_id' => [
                $isPack ? 'nullable' : 'required',
                'integer',
                'exists:instrumentals,id',
            ],
            'pack_id' => [
                $isPack ? 'required' : 'nullable',
                'integer',
                'exists:packs,id',
            ],
            'type' => [
                'required',
                'string',
                Rule::in([OrderService::TYPE_NON_EXCLUSIVE, OrderService::TYPE_EXCLUSIVE, 'pack']),
            ],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'instrumental_id.required' => 'L\'instrumentale est obligatoire.',
            'instrumental_id.exists'   => 'Cette instrumentale n\'existe pas.',
            'pack_id.required'         => 'Le pack est obligatoire.',
            'pack_id.exists'           => 'Ce pack n\'existe pas.',
            'type.required'            => 'Le type d\'achat est obligatoire.',
            'type.in'                  => 'Type d\'achat invalide.',
            'promo_code.max'           => 'Le code promo est trop long.',
        ];
    }
}