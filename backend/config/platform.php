<?php

return [
    'prices' => [
        'non_exclusive' => env('PRICE_NON_EXCLUSIVE', 7000),
        'exclusive'     => env('PRICE_EXCLUSIVE', 20000),
    ],

      'features' => [
        'packs_enabled' => env('FEATURE_PACKS_ENABLED', false),
    ],

];