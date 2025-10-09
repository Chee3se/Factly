import * as React from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    description: "",
    image_url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("decorations.store"));
  };

  return (
    <>
      <Head title="Create Decoration" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-6">Create Decoration</h1>

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
                  {processing ? "Creating..." : "Create Decoration"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
