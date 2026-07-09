<?php
 
namespace App\Http\Controllers;
 
use App\Models\RestaurantOrder;
use Illuminate\Http\JsonResponse;
 
class RestaurantOrderController extends Controller
{
    /**
     * Get dashboard stats for restaurant orders
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            // Include 'Available' in the array along with your standard active statuses
            $activeStatuses = ['Available', 'Out of Stock', 'active'];
 
            // Counts all records where the status matches any value in the array
            $activeOrdersCount = RestaurantOrder::whereIn('status', $activeStatuses)->count();
           
            return response()->json([
                'active_orders_count' => $activeOrdersCount
            ], 200);
 
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
 