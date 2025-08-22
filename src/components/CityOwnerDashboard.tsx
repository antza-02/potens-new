import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Users, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Star, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  DollarSign,
  Target,
  Activity,
  Shield,
  FileText,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import CityAnalyticsDashboard from './CityAnalyticsDashboard';
import CityUserManagement from './CityUserManagement';
import CityFinancialManagement from './CityFinancialManagement';

interface CityOwnerDashboardProps {
  onBack: () => void;
  language: string;
  cityName?: string;
}

interface Venue {
  id: number;
  name: string;
  type: string;
  city: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  capacity: number;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  bookings: number;
  revenue: number;
  utilization_rate: number;
}

interface Booking {
  id: string;
  venue_name: string;
  customer_name: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  venue_id: number;
}

interface CityStats {
  totalRevenue: number;
  totalBookings: number;
  activeVenues: number;
  avgRating: number;
  pendingApprovals: number;
  maintenanceAlerts: number;
  monthlyGrowth: number;
}

export default function CityOwnerDashboard({ onBack, language, cityName = 'Helsinki' }: CityOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'venues' | 'bookings' | 'users' | 'finance' | 'reports'>('overview');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cityStats, setCityStats] = useState<CityStats>({
    totalRevenue: 0,
    totalBookings: 0,
    activeVenues: 0,
    avgRating: 0,
    pendingApprovals: 0,
    maintenanceAlerts: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [venueTypeFilter, setVenueTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showVenueDialog, setShowVenueDialog] = useState(false);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const translations = {
    fi: {
      title: 'Kaupungin Omistajan Hallinta',
      overview: 'Yleiskatsaus',
      venues: 'Tilat',
      bookings: 'Varaukset',
      users: 'Käyttäjät',
      finance: 'Taloustiedot',
      reports: 'Raportit',
      back: 'Takaisin',
      totalRevenue: 'Kokonaistulot',
      totalBookings: 'Varaukset yhteensä',
      activeVenues: 'Aktiiviset tilat',
      avgRating: 'Keskiarvoarvosana',
      pendingApprovals: 'Odottaa hyväksyntää',
      maintenanceAlerts: 'Huoltovaroitukset',
      monthlyGrowth: 'Kuukausikasvun',
      recentBookings: 'Viimeisimmät varaukset',
      venuePerformance: 'Tilan suorituskyky',
      quickActions: 'Pikatoiminnot',
      approveAll: 'Hyväksy kaikki',
      sendAlert: 'Lähetä ilmoitus',
      addVenue: 'Lisää tila',
      editVenue: 'Muokkaa tilaa',
      deleteVenue: 'Poista tila',
      venueName: 'Tilan nimi',
      venueType: 'Tilan tyyppi',
      city: 'Kaupunki',
      capacity: 'Kapasiteetti',
      price: 'Hinta per tunti',
      description: 'Kuvaus',
      amenities: 'Mukavuudet',
      save: 'Tallenna',
      cancel: 'Peruuta',
      active: 'Aktiivinen',
      inactive: 'Pois käytöstä',
      maintenance: 'Huolto',
      confirmed: 'Vahvistettu',
      pending: 'Odottaa',
      cancelled: 'Peruutettu',
      viewDetails: 'Näytä tiedot',
      manageAvailability: 'Hallitse saatavuutta',
      uploadImages: 'Lataa kuvia',
      searchVenues: 'Etsi tiloja...',
      allTypes: 'Kaikki tyypit',
      allStatuses: 'Kaikki tilat',
      sauna: 'Sauna',
      meetingRoom: 'Kokoushuone',
      tennisCourt: 'Tenniskenttä',
      creativeSpace: 'Luova tila',
      sportsHall: 'Liikuntahalli',
      cityOwner: 'Kaupungin omistaja',
      revenue: 'Tulot',
      utilization: 'Käyttöaste',
      performance: 'Suorituskyky',
      alerts: 'Ilmoitukset',
      notifications: 'Ilmoitukset',
      cityAlerts: 'Kaupungin ilmoitukset',
      weather: 'Sää',
      due: 'Erääntyy',
      weatherAlert: 'Säävaroitus',
      maintenanceDue: 'Huolto erääntyy',
      cityUpdate: 'Kaupungin päivitys'
    },
    en: {
      title: 'City Owner Dashboard',
      overview: 'Overview',
      venues: 'Venues',
      bookings: 'Bookings',
      users: 'Users',
      finance: 'Finance',
      reports: 'Reports',
      back: 'Back',
      totalRevenue: 'Total Revenue',
      totalBookings: 'Total Bookings',
      activeVenues: 'Active Venues',
      avgRating: 'Average Rating',
      pendingApprovals: 'Pending Approvals',
      maintenanceAlerts: 'Maintenance Alerts',
      monthlyGrowth: 'Monthly Growth',
      recentBookings: 'Recent Bookings',
      venuePerformance: 'Venue Performance',
      quickActions: 'Quick Actions',
      approveAll: 'Approve All',
      sendAlert: 'Send Alert',
      addVenue: 'Add Venue',
      editVenue: 'Edit Venue',
      deleteVenue: 'Delete Venue',
      venueName: 'Venue Name',
      venueType: 'Venue Type',
      city: 'City',
      capacity: 'Capacity',
      price: 'Price per hour',
      description: 'Description',
      amenities: 'Amenities',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      viewDetails: 'View Details',
      manageAvailability: 'Manage Availability',
      uploadImages: 'Upload Images',
      searchVenues: 'Search venues...',
      allTypes: 'All types',
      allStatuses: 'All statuses',
      sauna: 'Sauna',
      meetingRoom: 'Meeting Room',
      tennisCourt: 'Tennis Court',
      creativeSpace: 'Creative Space',
      sportsHall: 'Sports Hall',
      cityOwner: 'City Owner',
      revenue: 'Revenue',
      utilization: 'Utilization',
      performance: 'Performance',
      alerts: 'Alerts',
      notifications: 'Notifications',
      cityAlerts: 'City Alerts',
      weather: 'Weather',
      due: 'Due',
      weatherAlert: 'Weather Alert',
      maintenanceDue: 'Maintenance Due',
      cityUpdate: 'City Update'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Mock data for demonstration
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    // Mock venues data
    const mockVenues: Venue[] = [
      {
        id: 1,
        name: "Keskuspuiston Sauna",
        type: "Sauna",
        city: cityName,
        price: 25,
        rating: 4.8,
        reviews: 124,
        image: "helsinki sauna wooden interior",
        amenities: ["Towels provided", "Changing room", "Shower"],
        capacity: 8,
        description: "Traditional Finnish sauna in the heart of Central Park",
        status: "active",
        bookings: 45,
        revenue: 1125,
        utilization_rate: 78
      },
      {
        id: 2,
        name: "Kaupungintalon Kokoushuone",
        type: "Meeting Room",
        city: cityName,
        price: 45,
        rating: 4.6,
        reviews: 89,
        image: "modern meeting room finland",
        amenities: ["Projector", "Whiteboard", "Coffee service"],
        capacity: 12,
        description: "Professional meeting space in city hall",
        status: "active",
        bookings: 32,
        revenue: 1440,
        utilization_rate: 65
      },
      {
        id: 3,
        name: "Urheilupuiston Tenniskenttä",
        type: "Tennis Court",
        city: cityName,
        price: 35,
        rating: 4.7,
        reviews: 156,
        image: "tennis court outdoor finland",
        amenities: ["Rackets available", "Ball machine", "Lighting"],
        capacity: 4,
        description: "Outdoor tennis court in sports park",
        status: "maintenance",
        bookings: 28,
        revenue: 980,
        utilization_rate: 45
      },
      {
        id: 4,
        name: "Luovan Talon Studio",
        type: "Creative Space",
        city: cityName,
        price: 30,
        rating: 4.9,
        reviews: 67,
        image: "creative studio finland",
        amenities: ["Art supplies", "Natural light", "Kitchen"],
        capacity: 6,
        description: "Inspiring creative space for artists and makers",
        status: "active",
        bookings: 38,
        revenue: 1140,
        utilization_rate: 82
      }
    ];

    // Mock bookings data
    const mockBookings: Booking[] = [
      {
        id: 'POT123456',
        venue_name: "Keskuspuiston Sauna",
        customer_name: "Matti M.",
        date: "2024-02-15",
        time: "14:00-15:00",
        price: 25,
        status: "confirmed",
        venue_id: 1
      },
      {
        id: 'POT123457',
        venue_name: "Kaupungintalon Kokoushuone",
        customer_name: "Anna K.",
        date: "2024-02-20",
        time: "10:00-12:00",
        price: 90,
        status: "pending",
        venue_id: 2
      },
      {
        id: 'POT123458',
        venue_name: "Urheilupuiston Tenniskenttä",
        customer_name: "Jukka L.",
        date: "2024-02-18",
        time: "16:00-17:00",
        price: 35,
        status: "confirmed",
        venue_id: 3
      }
    ];

    // Calculate city stats
    const totalRevenue = mockVenues.reduce((sum, venue) => sum + venue.revenue, 0);
    const totalBookings = mockVenues.reduce((sum, venue) => sum + venue.bookings, 0);
    const activeVenues = mockVenues.filter(v => v.status === 'active').length;
    const avgRating = mockVenues.reduce((sum, venue) => sum + venue.rating, 0) / mockVenues.length;
    const pendingApprovals = mockBookings.filter(b => b.status === 'pending').length;
    const maintenanceAlerts = mockVenues.filter(v => v.status === 'maintenance').length;

    setVenues(mockVenues);
    setBookings(mockBookings);
    setCityStats({
      totalRevenue,
      totalBookings,
      activeVenues,
      avgRating: Math.round(avgRating * 10) / 10,
      pendingApprovals,
      maintenanceAlerts,
      monthlyGrowth: 12.5
    });

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-orange-100 text-orange-800"
    };
    
    const statusTexts = {
      confirmed: t.confirmed,
      pending: t.pending,
      cancelled: t.cancelled,
      active: t.active,
      inactive: t.inactive,
      maintenance: t.maintenance
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusTexts[status as keyof typeof statusTexts]}
      </Badge>
    );
  };

  const getVenueTypeLabel = (type: string) => {
    const typeLabels = {
      'Sauna': t.sauna,
      'Meeting Room': t.meetingRoom,
      'Tennis Court': t.tennisCourt,
      'Creative Space': t.creativeSpace,
      'Sports Hall': t.sportsHall
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = venueTypeFilter === 'all' || venue.type === venueTypeFilter;
    const matchesStatus = statusFilter === 'all' || venue.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApproveAll = () => {
    setActionMessage({ type: 'success', message: 'All pending bookings approved successfully!' });
  };

  const handleSendAlert = () => {
    setActionMessage({ type: 'success', message: 'City-wide alert sent successfully!' });
  };

  // Clear action message after 5 seconds
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        setActionMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ladataan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Button>
              <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              <Badge variant="outline" className="ml-2">
                <MapPin className="h-3 w-3 mr-1" />
                {cityName}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-gray-600">{t.cityOwner}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Action Message Display */}
      {actionMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert className={actionMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className={actionMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {actionMessage.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">{t.overview}</TabsTrigger>
              <TabsTrigger value="venues">{t.venues}</TabsTrigger>
              <TabsTrigger value="bookings">{t.bookings}</TabsTrigger>
              <TabsTrigger value="users">{t.users}</TabsTrigger>
              <TabsTrigger value="finance">{t.finance}</TabsTrigger>
              <TabsTrigger value="reports">{t.reports}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{cityStats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{cityStats.monthlyGrowth}% {t.monthlyGrowth.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalBookings}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cityStats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {cityStats.pendingApprovals} {t.pending.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activeVenues}</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cityStats.activeVenues}</div>
                  <p className="text-xs text-muted-foreground">
                    {cityStats.maintenanceAlerts} {t.maintenance.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.avgRating}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cityStats.avgRating}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {venues.length} venues
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {t.quickActions}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleApproveAll}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.approveAll}
                  </Button>
                  <Button 
                    onClick={handleSendAlert}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {t.sendAlert}
                  </Button>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {t.alerts}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cityStats.maintenanceAlerts > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-800">
                        {cityStats.maintenanceAlerts} {t.maintenanceDue.toLowerCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {t.weatherAlert}: Sunny, 18°C
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    {t.recentBookings}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{booking.venue_name}</p>
                          <p className="text-xs text-gray-500">{booking.date}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Venue Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t.venuePerformance}</CardTitle>
                <CardDescription>
                  Performance metrics across all venues in {cityName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {venues.map((venue) => (
                    <div key={venue.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{venue.name}</h4>
                        {getStatusBadge(venue.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.revenue}:</span>
                          <span className="font-medium">€{venue.revenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.bookings}:</span>
                          <span className="font-medium">{venue.bookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.utilization}:</span>
                          <span className="font-medium">{venue.utilization_rate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t.searchVenues}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={venueTypeFilter} onValueChange={setVenueTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allTypes}</SelectItem>
                  <SelectItem value="Sauna">{t.sauna}</SelectItem>
                  <SelectItem value="Meeting Room">{t.meetingRoom}</SelectItem>
                  <SelectItem value="Tennis Court">{t.tennisCourt}</SelectItem>
                  <SelectItem value="Creative Space">{t.creativeSpace}</SelectItem>
                  <SelectItem value="Sports Hall">{t.sportsHall}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses}</SelectItem>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                  <SelectItem value="maintenance">{t.maintenance}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowAddVenue(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t.addVenue}</span>
              </Button>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <ImageWithFallback
                        src={`https://images.unsplash.com/search/photos?query=${venue.image}&w=400&h=200&fit=crop`}
                        alt={venue.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(venue.status)}
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-medium">{venue.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{venue.city}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {getVenueTypeLabel(venue.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{t.bookings}</p>
                          <p className="text-lg font-medium">{venue.bookings}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{t.revenue}</p>
                          <p className="text-lg font-medium">€{venue.revenue}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm">{venue.rating}</span>
                          <span className="text-sm text-gray-600 ml-2">€{venue.price}/h</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVenue(venue);
                              setShowVenueDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {venue.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.bookings}</CardTitle>
                <CardDescription>
                  {bookings.length} {t.bookings.toLowerCase()} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venue</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.venue_name}</TableCell>
                          <TableCell>{booking.customer_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3" />
                              <span>{booking.date}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{booking.time}</span>
                            </div>
                          </TableCell>
                          <TableCell>€{booking.price}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                {t.viewDetails}
                              </Button>
                              {booking.status === 'pending' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  {language === 'fi' ? 'Hyväksy' : 'Approve'}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <CityUserManagement 
              cityName={cityName}
              language={language}
            />
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <CityFinancialManagement 
              cityName={cityName}
              language={language}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <CityAnalyticsDashboard 
              cityName={cityName}
              language={language}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Venue Edit Dialog */}
      <Dialog open={showVenueDialog} onOpenChange={setShowVenueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editVenue}</DialogTitle>
            <DialogDescription>
              {selectedVenue?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t.venueName}</label>
                  <Input value={selectedVenue.name} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.venueType}</label>
                  <Input value={getVenueTypeLabel(selectedVenue.type)} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.city}</label>
                  <Input value={selectedVenue.city} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.capacity}</label>
                  <Input value={selectedVenue.capacity.toString()} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.price} (€)</label>
                  <Input value={selectedVenue.price.toString()} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedVenue.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t.active}</SelectItem>
                      <SelectItem value="inactive">{t.inactive}</SelectItem>
                      <SelectItem value="maintenance">{t.maintenance}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowVenueDialog(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={() => setShowVenueDialog(false)}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
