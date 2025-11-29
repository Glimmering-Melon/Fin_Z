<?php

namespace App\Http\Controllers\Traits;

trait SharesFakeUserData
{
    protected function getFakeUserData(): array
    {
        return [
            'auth' => [
                'user' => [
                    'id' => 1,
                    'name' => 'Demo User',
                    'email' => 'demo@example.com',
                    'avatar' => null,
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ],
        ];
    }
}
