import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin,
  Clock,
  Star,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number[];
    growth: number;
    trend: 'up' | 'down';
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    monthly: number[];
  };
  venues: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
    performance: Array<{
      id: number;
      name: string;
      revenue: number;
      bookings: number;
      rating: number;
      utilization: number;
    }>;
  };
  users: {
    total: number;
    new: number;
    active: number;
    returning: number;
  };
  trends: {
    peakHours: Array<{ hour: string; bookings: number }>;
    popularDays: Array<{ day: string; bookings: number }>;
    seasonalTrends: Array<{ month: string; revenue: number; bookings: number }>;
  };
}

interface CityAnalyticsDashboardProps {
  cityName: string;
  language: string;
  data?: AnalyticsData;
}

export default function CityAnalyticsDashboard({ 
  cityName, 
  language, 
  data 
}: CityAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'bookings' | 'venues' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [venueFilter, setVenueFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const translations = {
    fi: {
      analytics: 'Analytiikka',
      overview: 'Yleiskatsaus',
      revenue: 'Tulot',
      bookings: 'Varaukset',
      venues: 'Tilat',
      trends: 'Trendit',
      timeRange: 'Aikaväli',
      week: 'Viikko',
      month: 'Kuukausi',
      quarter: 'Neljännesvuosi',
      year: 'Vuosi',
      totalRevenue: 'Kokonaistulot',
      monthlyGrowth: 'Kuukausikasvu',
      totalBookings: 'Varaukset yhteensä',
      confirmedBookings: 'Vahvistetut varaukset',
      pendingBookings: 'Odottaa hyväksyntää',
      cancelledBookings: 'Peruutetut varaukset',
      totalVenues: 'Tilat yhteensä',
      activeVenues: 'Aktiiviset tilat',
      maintenanceVenues: 'Huoltotilat',
      inactiveVenues: 'Ei aktiiviset tilat',
      totalUsers: 'Käyttäjät yhteensä',
      newUsers: 'Uudet käyttäjät',
      activeUsers: 'Aktiiviset käyttäjät',
      returningUsers: 'Palaavat käyttäjät',
      venuePerformance: 'Tilan suorituskyky',
      topVenues: 'Parhaat tilat',
      revenueTrends: 'Tulotrendit',
      bookingTrends: 'Varauksentrendit',
      peakHours: 'Ruuhka-ajat',
      popularDays: 'Suosituimmat päivät',
      seasonalTrends: 'Sesonkivaihtelut',
      exportData: 'Vie data',
      refresh: 'Päivitä',
      searchVenues: 'Etsi tiloja...',
      allVenues: 'Kaikki tilat',
      revenue: 'Tulot',
      bookings: 'Varaukset',
      rating: 'Arvosana',
      utilization: 'Käyttöaste',
      performance: 'Suorituskyky',
      trends: 'Trendit',
      growth: 'Kasvu',
      decline: 'Lasku',
      stable: 'Vakaa',
      excellent: 'Erinomainen',
      good: 'Hyvä',
      average: 'Keskitaso',
      poor: 'Huono',
      noData: 'Ei dataa saatavilla',
      loading: 'Ladataan...',
      chartComingSoon: 'Kaavio tulossa',
      dataExport: 'Datan vienti',
      csvExport: 'Vie CSV',
      pdfExport: 'Vie PDF',
      excelExport: 'Vie Excel'
    },
    en: {
      analytics: 'Analytics',
      overview: 'Overview',
      revenue: 'Revenue',
      bookings: 'Bookings',
      venues: 'Venues',
      trends: 'Trends',
      timeRange: 'Time Range',
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
      year: 'Year',
      totalRevenue: 'Total Revenue',
      monthlyGrowth: 'Monthly Growth',
      totalBookings: 'Total Bookings',
      confirmedBookings: 'Confirmed Bookings',
      pendingBookings: 'Pending Bookings',
      cancelledBookings: 'Cancelled Bookings',
      totalVenues: 'Total Venues',
      activeVenues: 'Active Venues',
      maintenanceVenues: 'Maintenance Venues',
      inactiveVenues: 'Inactive Venues',
      totalUsers: 'Total Users',
      newUsers: 'New Users',
      activeUsers: 'Active Users',
      returningUsers: 'Returning Users',
      venuePerformance: 'Venue Performance',
      topVenues: 'Top Venues',
      revenueTrends: 'Revenue Trends',
      bookingTrends: 'Booking Trends',
      peakHours: 'Peak Hours',
      popularDays: 'Popular Days',
      seasonalTrends: 'Seasonal Trends',
      exportData: 'Export Data',
      refresh: 'Refresh',
      searchVenues: 'Search venues...',
      allVenues: 'All venues',
      revenue: 'Revenue',
      bookings: 'Bookings',
      rating: 'Rating',
      utilization: 'Utilization',
      performance: 'Performance',
      trends: 'Trends',
      growth: 'Growth',
      decline: 'Decline',
      stable: 'Stable',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor',
      noData: 'No data available',
      loading: 'Loading...',
      chartComingSoon: 'Chart coming soon',
      dataExport: 'Data Export',
      csvExport: 'Export CSV',
      pdfExport: 'Export PDF',
      excelExport: 'Export Excel'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    revenue: {
      total: 45680,
      monthly: [32000, 35000, 38000, 42000, 45680],
      growth: 12.5,
      trend: 'up'
    },
    bookings: {
      total: 1247,
      confirmed: 1189,
      pending: 45,
      cancelled: 13,
      monthly: [890, 920, 980, 1100, 1247]
    },
    venues: {
      total: 12,
      active: 10,
      maintenance: 1,
      inactive: 1,
      performance: [
        { id: 1, name: "Keskuspuiston Sauna", revenue: 12500, bookings: 156, rating: 4.8, utilization: 78 },
        { id: 2, name: "Kaupungintalon Kokoushuone", revenue: 9800, bookings: 89, rating: 4.6, utilization: 65 },
        { id: 3, name: "Urheilupuiston Tenniskenttä", revenue: 7200, bookings: 134, rating: 4.7, utilization: 82 },
        { id: 4, name: "Luovan Talon Studio", revenue: 6800, bookings: 98, rating: 4.9, utilization: 71 }
      ]
    },
    users: {
      total: 2341,
      new: 156,
      active: 1890,
      returning: 451
    },
    trends: {
      peakHours: [
        { hour: '09:00', bookings: 45 },
        { hour: '10:00', bookings: 67 },
        { hour: '14:00', bookings: 89 },
        { hour: '16:00', bookings: 78 },
        { hour: '18:00', bookings: 56 }
      ],
      popularDays: [
        { day: 'Monday', bookings: 156 },
        { day: 'Tuesday', bookings: 178 },
        { day: 'Wednesday', bookings: 189 },
        { day: 'Thursday', bookings: 167 },
        { day: 'Friday', bookings: 145 },
        { day: 'Saturday', bookings: 234 },
        { day: 'Sunday', bookings: 198 }
      ],
      seasonalTrends: [
        { month: 'Jan', revenue: 32000, bookings: 890 },
        { month: 'Feb', revenue: 35000, bookings: 920 },
        { month: 'Mar', revenue: 38000, bookings: 980 },
        { month: 'Apr', revenue: 42000, bookings: 1100 },
        { month: 'May', revenue: 45680, bookings: 1247 }
      ]
    }
  };

  const currentData = data || mockData;

  const getPerformanceColor = (utilization: number) => {
    if (utilization >= 80) return 'text-green-600';
    if (utilization >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (utilization: number) => {
    if (utilization >= 80) return t.excellent;
    if (utilization >= 60) return t.good;
    if (utilization >= 40) return t.average;
    return t.poor;
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting data in ${format} format`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.analytics}</h2>
          <p className="text-gray-600">{cityName} - {t.analytics.toLowerCase()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t.week}</SelectItem>
              <SelectItem value="month">{t.month}</SelectItem>
              <SelectItem value="quarter">{t.quarter}</SelectItem>
              <SelectItem value="year">{t.year}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportData}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="revenue">{t.revenue}</TabsTrigger>
          <TabsTrigger value="bookings">{t.bookings}</TabsTrigger>
          <TabsTrigger value="venues">{t.venues}</TabsTrigger>
          <TabsTrigger value="trends">{t.trends}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{currentData.revenue.total.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {getTrendIcon(currentData.revenue.trend)}
                  <span className={currentData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    +{currentData.revenue.growth}%
                  </span>
                  <span>{t.monthlyGrowth.toLowerCase()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalBookings}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.bookings.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {currentData.bookings.confirmed} {t.confirmed.toLowerCase()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalVenues}</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.venues.total}</div>
                <p className="text-xs text-muted-foreground">
                  {currentData.venues.active} {t.active.toLowerCase()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{currentData.users.new} {t.new.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.venuePerformance}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.venues.performance.slice(0, 3).map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{venue.name}</p>
                        <p className="text-xs text-gray-500">
                          {venue.bookings} {t.bookings.toLowerCase()} • €{venue.revenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getPerformanceColor(venue.utilization)}`}>
                          {venue.utilization}%
                        </div>
                        <div className="text-xs text-gray-500">{getPerformanceLabel(venue.utilization)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.peakHours}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.trends.peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{hour.hour}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(hour.bookings / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{hour.bookings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.revenueTrends}</CardTitle>
              <CardDescription>
                Revenue performance over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{t.chartComingSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.confirmedBookings}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">{currentData.bookings.confirmed}</div>
                <p className="text-sm text-gray-500">
                  {((currentData.bookings.confirmed / currentData.bookings.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.pendingBookings}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{currentData.bookings.pending}</div>
                <p className="text-sm text-gray-500">
                  {((currentData.bookings.pending / currentData.bookings.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.cancelledBookings}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-red-600">{currentData.bookings.cancelled}</div>
                <p className="text-sm text-gray-500">
                  {((currentData.bookings.cancelled / currentData.bookings.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.bookingTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{t.chartComingSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-6">
          {/* Venue Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t.searchVenues}
                className="max-w-sm"
              />
            </div>
            <Select value={venueFilter} onValueChange={setVenueFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allVenues}</SelectItem>
                <SelectItem value="active">{t.activeVenues}</SelectItem>
                <SelectItem value="maintenance">{t.maintenanceVenues}</SelectItem>
                <SelectItem value="inactive">{t.inactiveVenues}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.topVenues}</CardTitle>
              <CardDescription>
                Performance metrics for all venues in {cityName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.venues.performance.map((venue) => (
                  <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{venue.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>⭐ {venue.rating}</span>
                        <span>📅 {venue.bookings} {t.bookings.toLowerCase()}</span>
                        <span>💰 €{venue.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(venue.utilization)}`}>
                        {venue.utilization}%
                      </div>
                      <div className="text-sm text-gray-500">{getPerformanceLabel(venue.utilization)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.popularDays}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.trends.popularDays.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(day.bookings / 250) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{day.bookings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.seasonalTrends}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">{t.chartComingSoon}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
