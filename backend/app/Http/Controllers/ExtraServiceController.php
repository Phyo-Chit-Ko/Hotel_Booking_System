<?php
 
namespace App\Http\Controllers;
 
use App\Models\Service;
use App\Http\Requests\StoreServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\RestaurantOrder;    
use App\Models\RestaurantOrderItem;
 
class ExtraServiceController extends Controller
{
    /**
     * Display UI Dashboard Table Data & Top Counter Cards
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $query = Service::query();
 
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('guest_name', 'like', "%{$search}%")
                  ->orWhere('reservation_id', 'like', "%{$search}%")
                  ->orWhere('service_type', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('food_items', 'like', "%{$search}%");
            });
        }
 
        $charges = $query->orderBy('id', 'asc')->get();
 
        $laundryCount = 0;
        $carRentalCount = 0;
        $foodCount = 0;
        $foodRevenueTotal = 0.0; // Added tracker variable to calculate revenue easily
 
        $formattedData = $charges->map(function ($charge) use (&$laundryCount, &$carRentalCount, &$foodCount, &$foodRevenueTotal) {
            $type = $charge->service_type ?? 'Laundry';
 
            if ($type === 'Laundry') $laundryCount++;
            if ($type === 'Car Rental') $carRentalCount++;
            if ($type === 'Food') {
                $foodCount++;
                $foodRevenueTotal += (float) $charge->total; // Sum totals exclusively for Food records
            }
 
            // FIX: If food_items was stored as JSON, cleanly decode it into a readable string or strip brackets for your React column
            $rawFoodItems = $charge->food_items;
            if (!empty($rawFoodItems)) {
                $decoded = json_decode($rawFoodItems, true);
                if (is_array($decoded)) {
                    // Check if it's an array of structured objects from React
                    if (isset($decoded[0]) && is_array($decoded[0]) && isset($decoded[0]['item_id'])) {
                        $lines = [];
                        foreach ($decoded as $item) {
                            $lines[] = "Item ID: " . $item['item_id'] . " (x" . $item['quantity'] . ")";
                        }
                        $rawFoodItems = implode(', ', $lines);
                    } else {
                        $rawFoodItems = implode(', ', $decoded);
                    }
                } else {
                    $rawFoodItems = trim($rawFoodItems, '"[]');
                }
            }
 
            return [
                'id'             => $charge->id,
                'reservation_id' => $charge->reservation_id,
                'guest_name'     => $charge->guest_name ?? 'Unknown',
                'charge_date'    => $charge->charge_date ? \Carbon\Carbon::parse($charge->charge_date)->format('Y-m-d') : null,
                'service_type'   => $type,
                'description'    => $charge->description ?? '',
                'food_items'     => $rawFoodItems ?? '',
                'quantity'       => (int) $charge->quantity,
                'rate'           => (float) $charge->rate,
                'total'          => (float) $charge->total,
            ];
        });
 
        return response()->json([
            'success' => true,
            'metrics' => [
                'laundry_count'      => $laundryCount,
                'car_rental_count'   => $carRentalCount,
                'food_count'         => $foodCount,
                'food_revenue_total' => $foodRevenueTotal, // Appended output payload for frontend consumption
            ],
            'services' => $formattedData
        ]);
    }
 
    /**
     * Store a newly created extra charge in the XAMPP database.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
 
        $quantity = (int) $validatedData['quantity'];
        $rate = (float) $validatedData['rate'];
        $validatedData['total'] = $quantity * $rate;
 
        $validatedData['created_by'] = Auth::id() ?? 1;
       
        $foodInput = $request->input('food_items');
       
        // Retain how your extra_charges table saves text strings while extracting parameters
        if (!empty($foodInput) && is_array($foodInput) && isset($foodInput[0]['item_id'])) {
            // Raw text fallback mapping description string into text logs
            $textLines = [];
            foreach ($foodInput as $item) {
                $textLines[] = "Item ID " . $item['item_id'] . " (x" . $item['quantity'] . ")";
            }
            $validatedData['food_items'] = json_encode([implode(', ', $textLines)]);
        } else {
            $validatedData['food_items'] = !empty($foodInput) ? (is_array($foodInput) ? json_encode($foodInput) : json_encode([$foodInput])) : null;
        }
       
        $validatedData['description'] = $request->input('description') ?? null;
 
        DB::beginTransaction();
 
        try {
            $extraCharge = Service::create($validatedData);
 
            // Relational Pipeline logic for Food selection type
            if (strtolower($validatedData['service_type']) === 'food') {
                $order = new RestaurantOrder();
                $order->order_date   = $validatedData['charge_date'];
                $order->order_time   = now()->toTimeString();
                $order->total_amount = $validatedData['total'];
                $order->status       = 'Completed';
                $order->save();
 
                if (!empty($foodInput) && is_array($foodInput)) {
                    foreach ($foodInput as $item) {
                        if (is_array($item) && isset($item['item_id'])) {
                            $orderItem = new RestaurantOrderItem();
                            $orderItem->order_id   = $order->order_id;
                            $orderItem->item_id    = $item['item_id'];
                            $orderItem->quantity   = $item['quantity'];
                            $orderItem->unit_price = $item['unit_price'];
                            $orderItem->subtotal   = $item['quantity'] * $item['unit_price'];
                            $orderItem->save();
                        }
                    }
                }
            }
 
            DB::commit();
 
            return response()->json([
                'success' => true,
                'message' => 'Extra charge record saved successfully to the database!',
                'data'    => $extraCharge
            ], 201);
 
        } catch (\Exception $e) {
            DB::rollBack();
 
            return response()->json([
                'success' => false,
                'message' => 'Database persistence failed. SQL Error: ' . $e->getMessage(),
                'error'   => $e->getMessage()
            ], 500);
        }
    }
 
    /**
     * Update an existing extra charge record.
     */
    public function update(StoreServiceRequest $request, $id): JsonResponse
    {
        $extraCharge = Service::find($id);
 
        if (!$extraCharge) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found.'
            ], 404);
        }
 
        $validatedData = $request->validated();
       
        $quantity = (int) $validatedData['quantity'];
        $rate = (float) $validatedData['rate'];
        $validatedData['total'] = $quantity * $rate;
       
        $foodInput = $request->input('food_items');
       
        if (!empty($foodInput) && is_array($foodInput) && isset($foodInput[0]['item_id'])) {
            $textLines = [];
            foreach ($foodInput as $item) {
                $textLines[] = "Item ID " . $item['item_id'] . " (x" . $item['quantity'] . ")";
            }
            $validatedData['food_items'] = json_encode([implode(', ', $textLines)]);
        } else {
            $validatedData['food_items'] = !empty($foodInput) ? (is_array($foodInput) ? json_encode($foodInput) : json_encode([$foodInput])) : null;
        }
       
        $validatedData['description'] = $request->input('description') ?? null;
 
        DB::beginTransaction();
 
        try {
            $extraCharge->update($validatedData);
 
            // Handle cascading table updates if modified charge corresponds to Food tracking data
            if (strtolower($validatedData['service_type']) === 'food') {
                $order = RestaurantOrder::where('order_date', $extraCharge->charge_date)
                    ->where('total_amount', $extraCharge->total)
                    ->first();
 
                if (!$order) {
                    $order = new RestaurantOrder();
                }
               
                $order->order_date   = $validatedData['charge_date'];
                $order->total_amount = $validatedData['total'];
                $order->status       = 'Completed';
                $order->save();
 
                // Refresh sub-items dynamically to map current state accurately
                RestaurantOrderItem::where('order_id', $order->order_id)->delete();
 
                if (!empty($foodInput) && is_array($foodInput)) {
                    foreach ($foodInput as $item) {
                        if (is_array($item) && isset($item['item_id'])) {
                            $orderItem = new RestaurantOrderItem();
                            $orderItem->order_id   = $order->order_id;
                            $orderItem->item_id    = $item['item_id'];
                            $orderItem->quantity   = $item['quantity'];
                            $orderItem->unit_price = $item['unit_price'];
                            $orderItem->subtotal   = $item['quantity'] * $item['unit_price'];
                            $orderItem->save();
                        }
                    }
                }
            }
 
            DB::commit();
 
            return response()->json([
                'success' => true,
                'message' => 'Extra charge updated successfully!',
                'data'    => $extraCharge
            ], 200);
 
        } catch (\Exception $e) {
            DB::rollBack();
 
            return response()->json([
                'success' => false,
                'message' => 'Database modification failed. SQL Error: ' . $e->getMessage(),
                'error'   => $e->getMessage()
            ], 500);
        }
    }
 
    /**
     * Remove the specified extra charge from the database.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $extraCharge = Service::find($id);
 
            if (!$extraCharge) {
                return response()->json([
                    'success' => false,
                    'message' => 'Record not found or already deleted.'
                ], 404);
            }
 
            $extraCharge->delete();
 
            return response()->json([
                'success' => true,
                'message' => 'Extra charge record deleted successfully!'
            ], 200);
 
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete record.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
 