<?php
//app\Console\Commands\GenerateLatePenalties.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contract;
use App\Models\Penalty;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GenerateLatePenalties extends Command
{
    protected $signature = 'penalties:generate';

    protected $description = 'Scans active contracts and generates pending 20% penalties for late payments.';

    public function handle()
    {
        $this->info('Starting Late Penalty Scan...');

        $autoGenerate = SystemSetting::getVal('penalty_auto_generate', 'true');
        if ($autoGenerate !== 'true') {
            $this->warn('Penalty Auto-Generation is disabled in System Settings. Aborting.');
            return;
        }

        $penaltyRate = (float) SystemSetting::getVal('penalty_rate', 0.20);
        $graceHours = (int) SystemSetting::getVal('penalty_grace_period_hours', 24);

        $targetDate = Carbon::now()->subMonth();
        $targetMonthString = $targetDate->format('Y-m');
        $targetMonthName = strtoupper($targetDate->format('F'));
        $targetYear = $targetDate->year;

        $activeContracts = Contract::where('is_active', true)->get();
        $penaltiesGenerated = 0;

        foreach ($activeContracts as $contract) {

            if (Carbon::parse($contract->start_date)->startOfMonth()->gt($targetDate->startOfMonth())) {
                continue;
            }

            $dueDay = Carbon::parse($contract->start_date)->day;

            $daysInTargetMonth = Carbon::createFromDate($targetYear, $targetDate->month, 1)->daysInMonth;
            $safeDueDay = min($dueDay, $daysInTargetMonth);

            $dueDate = Carbon::createFromDate($targetYear, $targetDate->month, $safeDueDay);

            $deadline = $dueDate->copy()->addHours($graceHours);

            if (Carbon::now()->gt($deadline)) {

                $paidAmount = $contract->payments()
                    ->where('payment_type', 'rent')
                    ->where('month', $targetMonthName)
                    ->where('year', $targetYear)
                    ->sum('amount');

                if ($paidAmount < $contract->monthly_rent) {

                    $existingPenalty = Penalty::where('contract_id', $contract->id)
                        ->where('month_covered', $targetMonthString)
                        ->first();

                    if (!$existingPenalty) {

                        $penaltyAmount = $contract->monthly_rent * $penaltyRate;

                        Penalty::create([
                            'contract_id' => $contract->id,
                            'month_covered' => $targetMonthString,
                            'original_amount' => $penaltyAmount,
                            'adjusted_amount' => $penaltyAmount,
                            'status' => 'pending',
                            'is_auto_generated' => true,
                            'notes' => "Auto-generated for missing {$targetMonthName} {$targetYear} payment. Deadline was " . $deadline->format('M d, Y g:i A')
                        ]);

                        $penaltiesGenerated++;
                    }
                }
            }
        }

        $this->info("Scan Complete. Generated {$penaltiesGenerated} new pending penalty tickets.");
        Log::info("Late Penalty Scan ran successfully. {$penaltiesGenerated} tickets created.");
    }
}
