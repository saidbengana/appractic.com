"use client";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/store/use-ui-store";
import { useAnalyticsStore } from "@/store/use-analytics-store";
import { useAccountStore } from "@/store/use-account-store";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { LineChart, BarChart } from "@/components/charts";

export default function DashboardPage() {
  const { userId } = auth();
  const { selectedPeriod, setSelectedPeriod } = useUIStore();
  const { analytics, isLoading, error, fetchAnalytics } = useAnalyticsStore();
  const { accounts, selectedAccount, setSelectedAccount } = useAccountStore();

  useEffect(() => {
    if (selectedAccount) {
      fetchAnalytics(selectedPeriod, selectedAccount.id);
    }
  }, [selectedPeriod, selectedAccount, fetchAnalytics]);

  useEffect(() => {
    if (accounts.length && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount, setSelectedAccount]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading analytics: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-4 flex items-center justify-between">
          <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
            <TabsList>
              {periods.map((period) => (
                <TabsTrigger key={period.value} value={period.value}>
                  {period.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Account Selection */}
      {accounts.length > 0 && (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 p-4">
            {accounts.map((account) => (
              <Button
                key={account.id}
                variant={selectedAccount?.id === account.id ? "default" : "outline"}
                className="flex items-center space-x-2"
                onClick={() => setSelectedAccount(account)}
              >
                <Avatar
                  className="h-6 w-6"
                  src={account.avatar_url}
                  alt={account.username}
                />
                <span>{account.username}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground">Total Posts</p>
              <p className="text-2xl font-bold">{analytics?.totalPosts || 0}</p>
              <p className="text-sm text-green-600">↑ {analytics?.postsGrowth || 0}% from last period</p>
            </div>
            <div>
              <p className="text-muted-foreground">Engagement Rate</p>
              <p className="text-2xl font-bold">
                {analytics?.engagementRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-red-600">↓ {analytics?.engagementGrowth || 0}% from last period</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Followers</p>
              <p className="text-2xl font-bold">{analytics?.totalFollowers || 0}</p>
              <p className="text-sm text-green-600">↑ {analytics?.followersGrowth || 0}% from last period</p>
            </div>
          </div>
        </Card>

        {/* Engagement Chart */}
        <Card className="p-6 col-span-2">
          <h2 className="text-lg font-semibold mb-4">Engagement Overview</h2>
          <div className="h-[300px]">
            <LineChart
              data={analytics?.engagementData || []}
              xField="date"
              yField="value"
              categories={["likes", "comments", "shares"]}
            />
          </div>
        </Card>

        {/* Post Performance */}
        <Card className="p-6 col-span-2">
          <h2 className="text-lg font-semibold mb-4">Post Performance</h2>
          <div className="h-[300px]">
            <BarChart
              data={analytics?.postPerformance || []}
              xField="date"
              yField="value"
              categories={["impressions", "reach", "engagement"]}
            />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
