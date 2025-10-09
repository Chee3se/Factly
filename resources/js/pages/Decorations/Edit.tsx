import * as React from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Decoration } from "@/types";

interface Props {
  decoration: Decoration;
  errors: Record<string, string>;
}

export default function Edit({ decoration, errors }: Props) {
  const { data, setData, put, processing } = useForm({
    name: decoration.name,
    description: decoration.description,
    image_url: decoration.image_url,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route("decorations.update", decoration.id));
  };

  return (
    <>
      <Head title={`Edit ${decoration.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Edit Decoration</h1>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="mb-4">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="text"
                    value={data.image_url}
                    onChange={(e) => setData("image_url", e.target.value)}
                    required
                  />
                  {errors.image_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>
                  )}
                </div>

                <Button type="submit" disabled={processing}>
                  {processing ? "Updating..." : "Update Decoration"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
