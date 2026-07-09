<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
 
use App\Models\RestaurantItem;
 
use Illuminate\Http\Request;
 
use Illuminate\Validation\Rule;
 
class RestaurantItemController extends Controller
 
{
 
    public function index(Request $request)
 
    {
 
        $query = RestaurantItem::query();
 
        if ($request->filled('search')) {
 
            $query->where('item_name', 'like', "%{$request->search}%");
 
        }
 
        if ($request->filled('category') && $request->category !== 'All') {
 
            $query->where('category', $request->category);
 
        }
 
        return response()->json($query->orderByDesc('item_id')->get());
 
    }
 
    public function store(Request $request)
 
    {
 
        $validated = $request->validate([
 
            'item_name' => 'required|string|max:255',
 
            'category'  => ['required', 'string', Rule::in(['Food', 'Snack', 'Drink', 'Dessert'])],
 
            'price'     => 'required|numeric|min:0',
 
            'status'    => ['nullable', 'string', Rule::in(['Available', 'Out of Stock'])],
 
        ]);
 
        $item = RestaurantItem::create([
 
            'item_name' => $validated['item_name'],
 
            'category'  => $validated['category'],
 
            'price'     => $validated['price'],
 
            'status'    => $validated['status'] ?? 'Available',
 
        ]);
 
        return response()->json(['item' => $item], 201);
 
    }
 
    public function update(Request $request, $id)
 
    {
 
        $item = RestaurantItem::where('item_id', $id)->firstOrFail();
 
        $validated = $request->validate([
 
            'item_name' => 'sometimes|string|max:255',
 
            'category'  => ['sometimes', 'string', Rule::in(['Food', 'Snack', 'Drink', 'Dessert'])],
 
            'price'     => 'sometimes|numeric|min:0',
 
            'status'    => ['sometimes', 'string', Rule::in(['Available', 'Out of Stock'])],
 
        ]);
 
        $item->update($validated);
 
        return response()->json(['item' => $item]);
 
    }
 
    public function toggleStatus($id)
 
    {
 
        $item = RestaurantItem::where('item_id', $id)->firstOrFail();
 
        $item->status = $item->status === 'Available' ? 'Out of Stock' : 'Available';
 
        $item->save();
 
        return response()->json(['item' => $item]);
 
    }
 
    public function destroy($id)
{
    $item = RestaurantItem::find($id);
 
    if (!$item) {
        return response()->json([
            'message' => 'Item not found'
        ], 404);
    }
 
    $item->delete();
 
    return response()->json([
        'message' => 'Item deleted successfully'
    ]);
}
 
}
 
 