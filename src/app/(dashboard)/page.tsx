"use client";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/store/use-ui-store";
import { useAnalyticsStore } from "@/store/use-analytics-store";

export default function DashboardPage() {
  const { userId } = auth();
  const { selectedPeriod, setSelectedPeriod } = useUIStore();
  const { analytics, isLoading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod, fetchAnalytics]);

  if (!userId) {
    redirect("/sign-in");
  }

  const periods = [
    { label: "Last 7 days", value: "7_days" },
    { label: "Last 30 days", value: "30_days" },
    { label: "Last 90 days", value: "90_days" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        Error loading analytics: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-4 flex items-center space-x-4">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold">{analytics?.totalPosts || 0}</p>
              <p className="text-sm text-green-600">↑ 12% from last period</p>
            </div>
            <div>
              <p className="text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold">
                {analytics?.engagementRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-red-600">↓ 0.8% from last period</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              {
                action: "Post Scheduled",
                time: "2 hours ago",
                description: "Marketing campaign for Q4",
              },
              {
                action: "Analytics Updated",
                time: "5 hours ago",
                description: "Monthly performance report",
              },
              {
                action: "Media Uploaded",
                time: "1 day ago",
                description: "New product images",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Create New Post
            </button>
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Schedule Content
            </button>
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
