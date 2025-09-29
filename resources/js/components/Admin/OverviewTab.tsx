import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users as UsersIcon,
  UserCheck,
  UserPlus,
  Trophy,
  Clock,
  Settings,
  Lightbulb,
} from "lucide-react";
import { AdminStats } from "@/types/admin";

interface OverviewTabProps {
  stats: AdminStats;
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ stats, onTabChange }: OverviewTabProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Admin Users",
      value: stats.total_admins,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Friends",
      value: stats.total_friends,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Friend Requests",
      value: stats.pending_friend_requests,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Scores",
      value: stats.total_scores,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Suggestions",
      value: stats.total_suggestions,
      icon: Lightbulb,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => onTabChange("users")}
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
            >
              <UsersIcon className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button
              onClick={() => onTabChange("friends")}
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
            >
              <UserPlus className="h-6 w-6" />
              <span>Manage Friends</span>
            </Button>
            <Button
              onClick={() => onTabChange("suggestions")}
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Lightbulb className="h-6 w-6" />
              <span>Review Suggestions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
