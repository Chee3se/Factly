import * as React from "react";
import { Head, Link } from "@inertiajs/react";
import { Decoration } from "@/types";

interface Props {
  decoration: Decoration;
}

export default function Show({ decoration }: Props) {
  return (
    <>
      <Head title={decoration.name} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{decoration.name}</h1>
                <div>
                  <Link
                    href={route("decorations.edit", decoration.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Edit
                  </Link>
                  <Link
                    href={route("decorations.index")}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Back to List
                  </Link>
                </div>
              </div>

              <div className="mb-4">
                <strong>Description:</strong>
                <p>{decoration.description}</p>
              </div>

              <div className="mb-4">
                <strong>Image URL:</strong>
                <p>{decoration.image_url}</p>
              </div>

              {decoration.image_url && (
                <div className="mb-4">
                  <strong>Preview:</strong>
                  <img
                    src={decoration.image_url}
                    alt={decoration.name}
                    className="max-w-xs max-h-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
