<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            Address::where('user_id', $request->user()->id)->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:32',
            'line1' => 'required|string|max:255',
            'line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:120',
            'state' => 'nullable|string|max:64',
            'postal_code' => 'required|string|max:20',
            'country' => 'nullable|string|size:2',
            'is_default' => 'boolean',
        ]);
        $data['user_id'] = $request->user()->id;
        $data['country'] = $data['country'] ?? 'US';

        $address = DB::transaction(function () use ($data, $request) {
            if (!empty($data['is_default'])) {
                Address::where('user_id', $request->user()->id)
                    ->update(['is_default' => false]);
            }
            return Address::create($data);
        });

        return response()->json($address, 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        $address->delete();
        return response()->json(['message' => 'Address removed']);
    }
}
