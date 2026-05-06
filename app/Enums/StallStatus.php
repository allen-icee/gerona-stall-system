<?php

namespace App\Enums;

enum StallStatus: string
{
    case VACANT = 'VACANT';
    case FOR_CONTRACT = 'FOR CONTRACT';
    case FOR_SIGNING = 'FOR SIGNING';
    case WAITING_PERMIT = 'WAITING FOR BUSINESS PERMIT';
    case ON_PROCESS = 'ON PROCESS';
    case FOR_CONFIRMATION = 'FOR CONFIRMATION';
    case UNPAID_PERMIT = 'UNPAID PERMIT';
    case SIGNED_CONTRACT = 'SIGNED CONTRACT';
    case CLOSED = 'CLOSED';
    case UNKNOWN = 'UNKNOWN';

    public function color(): string
    {
        return match ($this) {
            self::VACANT => '#9CA3AF',
            self::FOR_CONTRACT => '#FBBF24',
            self::FOR_SIGNING => '#F59E0B',
            self::WAITING_PERMIT => '#3B82F6',
            self::ON_PROCESS => '#6366F1',
            self::FOR_CONFIRMATION => '#8B5CF6',
            self::UNPAID_PERMIT => '#EF4444',
            self::SIGNED_CONTRACT => '#10B981',
            self::CLOSED => '#374151',
            self::UNKNOWN => '#6B7280',
        };
    }
}
