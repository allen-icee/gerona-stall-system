<?php

namespace App\Enums;

enum StallStatus: string
{
    case VACANT = 'VACANT';
    case OCCUPIED = 'OCCUPIED';
    case FOR_CLOSURE = 'FOR CLOSURE';

    public function color(): string
    {
        return match ($this) {
            self::VACANT => '#10B981',       // Emerald Green
            self::OCCUPIED => '#FFFFFF',     // White
            self::FOR_CLOSURE => '#EF4444',  // Red
        };
    }
}
