import React, { useState } from "react";
import App from "@/layouts/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import OverviewTab from "@/components/Admin/OverviewTab";
import UsersTab from "@/components/Admin/UsersTab";
import FriendsTab from "@/components/Admin/FriendsTab";
import SuggestionsTab from "@/components/Admin/SuggestionsTab";
import { AdminDashboardProps } from "@/types/admin";

export default function Dashboard({
  auth,
  stats,
  users: initialUsers,
  friends: initialFriends,
  suggestions: initialSuggestions,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const [users, setUsers] = useState(initialUsers);
  const [friends, setFriends] = useState(initialFriends);
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  return (
    <App title="Admin Dashboard" auth={auth}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified management interface for users, friends, and suggestions
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="overview"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Users ({users.total})
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Friends ({friends.total})
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Suggestions ({suggestions.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab stats={stats} onTabChange={setActiveTab} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} onUpdateUsers={setUsers} />
          </TabsContent>

          <TabsContent value="friends">
            <FriendsTab friends={friends} onUpdateFriends={setFriends} />
          </TabsContent>

          <TabsContent value="suggestions">
            <SuggestionsTab
              suggestions={suggestions}
              onUpdateSuggestions={setSuggestions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </App>
  );
}
