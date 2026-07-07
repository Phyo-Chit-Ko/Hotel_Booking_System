<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FloorLayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FloorLayoutController extends Controller
{
    /**
     * GET /api/floor-layout?floor=2
     * Returns all amenity/zone cells for a floor.
     */
    public function index(Request $request)
    {
        $floor = $request->query('floor', '2');

        $cells = FloorLayout::where('floor', $floor)
            ->orderBy('id')
            ->get()
            ->map(fn($c) => [
                'id'       => $c->id,
                'type'     => $c->type,
                'label'    => $c->label,
                'col'      => (int) $c->col,
                'row'      => (int) $c->row,
                'w'        => (int) $c->w,
                'h'        => (int) $c->h,
                'vertical' => (bool) $c->vertical,
                'color'    => $c->color,
            ]);

        return response()->json([
            'success' => true,
            'floor'   => $floor,
            'cells'   => $cells,
        ]);
    }

    /**
     * POST /api/floor-layout
     * Adds a new amenity/zone cell.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'floor'    => 'required|string',
            'type'     => 'required|string|in:pool,gym,elevator,walkway,emergency_exit,stairs,reception,restaurant,parking,custom',
            'label'    => 'required|string|max:100',
            'col'      => 'required|integer|min:1',
            'row'      => 'required|integer|min:1',
            'w'        => 'required|integer|min:1|max:11',
            'h'        => 'required|integer|min:1|max:14',
            'vertical' => 'boolean',
            'color'    => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $cell = FloorLayout::create([
            'floor'    => $request->floor,
            'type'     => $request->type,
            'label'    => $request->label,
            'col'      => $request->col,
            'row'      => $request->row,
            'w'        => $request->w,
            'h'        => $request->h,
            'vertical' => $request->boolean('vertical', false),
            'color'    => $request->color,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Cell '{$cell->label}' added.",
            'cell'    => $cell,
        ], 201);
    }

    /**
     * PATCH /api/floor-layout/{id}
     * Updates position, size, label, or type of a cell.
     */
    public function update(Request $request, int $id)
    {
        $cell = FloorLayout::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type'     => 'sometimes|string|in:pool,gym,elevator,walkway,emergency_exit,stairs,reception,restaurant,parking,custom',
            'label'    => 'sometimes|string|max:100',
            'col'      => 'sometimes|integer|min:1',
            'row'      => 'sometimes|integer|min:1',
            'w'        => 'sometimes|integer|min:1|max:11',
            'h'        => 'sometimes|integer|min:1|max:14',
            'vertical' => 'sometimes|boolean',
            'color'    => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $cell->update($request->only(['type','label','col','row','w','h','vertical','color']));

        return response()->json([
            'success' => true,
            'message' => "Cell updated.",
            'cell'    => $cell,
        ]);
    }

    /**
     * DELETE /api/floor-layout/{id}
     * Removes a cell from the floor layout.
     */
    public function destroy(int $id)
    {
        $cell = FloorLayout::findOrFail($id);
        $cell->delete();

        return response()->json([
            'success' => true,
            'message' => "Cell removed from layout.",
        ]);
    }
}
