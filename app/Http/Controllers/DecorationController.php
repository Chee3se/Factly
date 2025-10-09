<?php

namespace App\Http\Controllers;

use App\Models\Decoration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DecorationController extends Controller
{
    /**
     * Display a listing of the decorations.
     */
    public function index(): Response
    {
        return Inertia::render('Decorations/Index', [
            'decorations' => Decoration::all(),
        ]);
    }

    /**
     * Show the form for creating a new decoration.
     */
    public function create(): Response
    {
        return Inertia::render('Decorations/Create');
    }

    /**
     * Store a newly created decoration in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'required|string|max:255',
        ]);

        Decoration::create($validated);

        return redirect()->route('decorations.index')->with('success', 'Decoration created successfully.');
    }

    /**
     * Display the specified decoration.
     */
    public function show(Decoration $decoration): Response
    {
        return Inertia::render('Decorations/Show', [
            'decoration' => $decoration,
        ]);
    }

    /**
     * Show the form for editing the specified decoration.
     */
    public function edit(Decoration $decoration): Response
    {
        return Inertia::render('Decorations/Edit', [
            'decoration' => $decoration,
        ]);
    }

    /**
     * Update the specified decoration in storage.
     */
    public function update(Request $request, Decoration $decoration)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'required|string|max:255',
        ]);

        $decoration->update($validated);

        return redirect()->route('decorations.index')->with('success', 'Decoration updated successfully.');
    }

    /**
     * Remove the specified decoration from storage.
     */
    public function destroy(Decoration $decoration)
    {
        $decoration->delete();

        return redirect()->route('decorations.index')->with('success', 'Decoration deleted successfully.');
    }
}
