import React from "react";
import App from "@/layouts/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Calendar, User } from "lucide-react";

interface Artwork {
  id: number;
  user_id: number;
  user_name: string;
  subject: string;
  artwork_data: string;
  score: number;
  created_at: string;
}

interface Game {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
}

interface Props {
  auth: Auth;
  artworks: Record<string, Artwork[]>;
  game: Game;
}

export default function CuratorsTestGallery({ auth, artworks, game }: Props) {
  const getAvatarUrl = (avatar?: string): string | undefined => {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const subjects = Object.keys(artworks);
  const totalArtworks = subjects.reduce(
    (total, subject) => total + artworks[subject].length,
    0,
  );

  return (
    <App auth={auth} title="Curator's Test Gallery">
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎨 Curator's Test Gallery</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Explore amazing artworks created by our community
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {totalArtworks} artworks
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {subjects.length} subjects
            </span>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">No artworks yet</h3>
            <p className="text-muted-foreground">
              Be the first to create and save your artwork in The Curator's
              Test!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {subjects.map((subject) => (
              <div key={subject} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">"{subject}"</h2>
                  <Badge variant="secondary" className="text-sm">
                    {artworks[subject].length} artwork
                    {artworks[subject].length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {artworks[subject].map((artwork) => (
                    <Card
                      key={artwork.id}
                      className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={artwork.artwork_data}
                          alt={`Artwork of "${subject}" by ${artwork.user_name}`}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={
                                  getAvatarUrl()
                                  // We don't have avatar data here, but could fetch user data if needed
                                }
                                alt={artwork.user_name}
                              />
                              <AvatarFallback className="text-xs">
                                {artwork.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm truncate">
                              {artwork.user_name}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {artwork.score}/100
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(artwork.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-muted-foreground mb-4">
            Want to add your artwork to the gallery?
          </p>
          <a
            href={`/games/${game.slug}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Play The Curator's Test
          </a>
        </div>
      </div>
    </App>
  );
}
