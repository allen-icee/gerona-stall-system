<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        $payments = DB::table('payments')->get();
        foreach ($payments as $payment) {
            // If it is a string (e.g., 'April', 'MAY'), convert it to integer
            if (!is_numeric($payment->month) && !empty($payment->month)) {
                $monthInt = date('n', strtotime($payment->month));
                DB::table('payments')->where('id', $payment->id)->update(['month' => $monthInt]);
            }
        }
    }
};
