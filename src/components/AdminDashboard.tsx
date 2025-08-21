import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Users, TrendingUp, MapPin, Clock, Star, BarChart3, Settings, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

const AdminDashboard = ({ onBack, language }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showAddVenue, setShowAddVenue] = useState(false);

  const translations = {
    fi: {
      back: "Takaisin",
      adminDashboard: "Hallinnan kojelauta",
      overview: "Yleiskatsaus",
      venues: "Tilat",
      bookings: "Varaukset",
      analytics: "Analytiikka",
      settings: "Asetukset",
      totalRevenue: "Kokonaistulot",
      totalBookings: "Varaukset yhteensä",
      activeVenues: "Aktiiviset tilat",
      avgRating: "Keskiarvoarvosana",
      recentBookings: "Viimeisimmät varaukset",
      popularVenues: "Suosituimmat tilat",
      addVenue: "Lisää tila",
      editVenue: "Muokkaa tilaa",
      deleteVenue: "Poista tila",
      venueName: "Tilan nimi",
      venueType: "Tilan tyyppi",
      city: "Kaupunki",
      capacity: "Kapasiteetti",
      price: "Hinta per tunti",
      description: "Kuvaus",
      amenities: "Mukavuudet",
      save: "Tallenna",
      cancel: "Peruuta",
      active: "Aktiivinen",
      inactive: "Pois käytöstä",
      confirmed: "Vahvistettu",
      pending: "Odottaa",
      cancelled: "Peruutettu",
      viewDetails: "Näytä tiedot",
      manageAvailability: "Hallitse saatavuutta",
      uploadImages: "Lataa kuvia"
    },
    en: {
      back: "Back",
      adminDashboard: "Admin Dashboard",
      overview: "Overview",
      venues: "Venues",
      bookings: "Bookings",
      analytics: "Analytics",
      settings: "Settings",
      totalRevenue: "Total Revenue",
      totalBookings: "Total Bookings",
      activeVenues: "Active Venues",
      avgRating: "Avg Rating",
      recentBookings: "Recent Bookings",
      popularVenues: "Popular Venues",
      addVenue: "Add Venue",
      editVenue: "Edit Venue",
      deleteVenue: "Delete Venue",
      venueName: "Venue Name",
      venueType: "Venue Type",
      city: "City",
      capacity: "Capacity",
      price: "Price per hour",
      description: "Description",
      amenities: "Amenities",
      save: "Save",
      cancel: "Cancel",
      active: "Active",
      inactive: "Inactive",
      confirmed: "Confirmed",
      pending: "Pending",
      cancelled: "Cancelled",
      viewDetails: "View Details",
      manageAvailability: "Manage Availability",
      uploadImages: "Upload Images"
    }
  };

  const t = translations[language];

  // Mock admin data
  const dashboardStats = {
    totalRevenue: 15420,
    totalBookings: 234,
    activeVenues: 12,
    avgRating: 4.7
  };

  const recentBookings = [
    {
      id: 'POT123456',
      venueName: "Keskuspuiston Sauna",
      customerName: "Matti M.",
      date: "2024-02-15",
      time: "14:00-15:00",
      price: 25,
      status: "confirmed"
    },
    {
      id: 'POT123457',
      venueName: "Kaupungintalon Kokoushuone",
      customerName: "Anna K.",
      date: "2024-02-20",
      time: "10:00-12:00",
      price: 90,
      status: "pending"
    },
    {
      id: 'POT123458',
      venueName: "Urheilupuiston Tenniskenttä",
      customerName: "Jukka L.",
      date: "2024-02-18",
      time: "16:00-17:00",
      price: 35,
      status: "confirmed"
    }
  ];

  const adminVenues = [
    {
      id: 1,
      name: "Keskuspuiston Sauna",
      type: "Sauna",
      city: "Helsinki",
      price: 25,
      capacity: 8,
      rating: 4.8,
      bookings: 45,
      revenue: 1125,
      status: "active",
      image: "helsinki sauna wooden interior"
    },
    {
      id: 2,
      name: "Kaupungintalon Kokoushuone",
      type: "Meeting Room",
      city: "Tampere",
      price: 45,
      capacity: 12,
      rating: 4.6,
      bookings: 32,
      revenue: 1440,
      status: "active",
      image: "modern meeting room finland"
    },
    {
      id: 3,
      name: "Urheilupuiston Tenniskenttä",
      type: "Tennis Court",
      city: "Turku",
      price: 35,
      capacity: 4,
      rating: 4.7,
      bookings: 28,
      revenue: 980,
      status: "inactive",
      image: "tennis court outdoor finland"
    }
  ];

  const [venueFormData, setVenueFormData] = useState({
    name: '',
    type: 'Sauna',
    city: 'Helsinki',
    capacity: 1,
    price: 25,
    description: '',
    amenities: '',
    status: 'active'
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800"
    };
    
    const statusTexts = {
      confirmed: t.confirmed,
      pending: t.pending,
      cancelled: t.cancelled,
      active: t.active,
      inactive: t.inactive
    };

    return (
      <Badge className={statusColors[status]}>
        {statusTexts[status]}
      </Badge>
    );
  };

  const handleVenueSubmit = (e) => {
    e.preventDefault();
    // Handle venue creation/update
    setShowAddVenue(false);
    setSelectedVenue(null);
    setVenueFormData({
      name: '',
      type: 'Sauna',
      city: 'Helsinki',
      capacity: 1,
      price: 25,
      description: '',
      amenities: '',
      status: 'active'
    });
  };

  const VenueForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedVenue ? t.editVenue : t.addVenue}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVenueSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">{t.venueName}</label>
              <Input
                value={venueFormData.name}
                onChange={(e) => setVenueFormData(prev => ({...prev, name: e.target.value}))}
                placeholder={language === 'fi' ? 'Esim. Keskuspuiston Sauna' : 'e.g. Central Park Sauna'}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">{t.venueType}</label>
              <select
                value={venueFormData.type}
                onChange={(e) => setVenueFormData(prev => ({...prev, type: e.target.value}))}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
              >
                <option value="Sauna">Sauna</option>
                <option value="Meeting Room">{language === 'fi' ? 'Kokoushuone' : 'Meeting Room'}</option>
                <option value="Tennis Court">{language === 'fi' ? 'Tenniskenttä' : 'Tennis Court'}</option>
                <option value="Creative Space">{language === 'fi' ? 'Luova tila' : 'Creative Space'}</option>
                <option value="Sports Hall">{language === 'fi' ? 'Liikuntahalli' : 'Sports Hall'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-2">{t.city}</label>
              <select
                value={venueFormData.city}
                onChange={(e) => setVenueFormData(prev => ({...prev, city: e.target.value}))}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
              >
                <option value="Helsinki">Helsinki</option>
                <option value="Tampere">Tampere</option>
                <option value="Turku">Turku</option>
                <option value="Oulu">Oulu</option>
                <option value="Espoo">Espoo</option>
                <option value="Vantaa">Vantaa</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-2">{t.capacity}</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={venueFormData.capacity}
                onChange={(e) => setVenueFormData(prev => ({...prev, capacity: parseInt(e.target.value)}))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">{t.price} (€)</label>
              <Input
                type="number"
                min="0"
                step="5"
                value={venueFormData.price}
                onChange={(e) => setVenueFormData(prev => ({...prev, price: parseInt(e.target.value)}))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Status</label>
              <select
                value={venueFormData.status}
                onChange={(e) => setVenueFormData(prev => ({...prev, status: e.target.value}))}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
              >
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-2">{t.description}</label>
            <textarea
              value={venueFormData.description}
              onChange={(e) => setVenueFormData(prev => ({...prev, description: e.target.value}))}
              placeholder={language === 'fi' ? 'Kuvaus tilasta...' : 'Description of the space...'}
              rows={3}
              className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">{t.amenities}</label>
            <Input
              value={venueFormData.amenities}
              onChange={(e) => setVenueFormData(prev => ({...prev, amenities: e.target.value}))}
              placeholder={language === 'fi' ? 'Pyyhkeet, suihku, pysäköinti' : 'Towels, shower, parking'}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
              {t.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddVenue(false);
                setSelectedVenue(null);
              }}
            >
              {t.cancel}
            </Button>
            <Button type="button" variant="outline" className="ml-auto">
              <Upload className="h-4 w-4 mr-2" />
              {t.uploadImages}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="flex items-center mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Button>
              <h1 className="text-2xl">{t.adminDashboard}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {t.settings}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="venues">{t.venues}</TabsTrigger>
            <TabsTrigger value="bookings">{t.bookings}</TabsTrigger>
            <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{t.totalRevenue}</p>
                      <p className="text-2xl">{dashboardStats.totalRevenue}€</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-pink-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{t.totalBookings}</p>
                      <p className="text-2xl">{dashboardStats.totalBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{t.activeVenues}</p>
                      <p className="text-2xl">{dashboardStats.activeVenues}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{t.avgRating}</p>
                      <p className="text-2xl">{dashboardStats.avgRating}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>{t.recentBookings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm">{booking.venueName}</p>
                          <p className="text-xs text-gray-600">{booking.customerName}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{booking.date}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">{booking.price}€</span>
                        {getStatusBadge(booking.status)}
                        <Button variant="ghost" size="sm">
                          {t.viewDetails}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="mt-6">
            {showAddVenue || selectedVenue ? (
              <VenueForm />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl">{t.venues}</h2>
                  <Button onClick={() => setShowAddVenue(true)} className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addVenue}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminVenues.map((venue) => (
                    <Card key={venue.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative">
                          <ImageWithFallback
                            src={`https://images.unsplash.com/search/photos?query=${venue.image}&w=400&h=200&fit=crop`}
                            alt={venue.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute top-2 right-2 flex space-x-2">
                            {getStatusBadge(venue.status)}
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg">{venue.name}</h3>
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{venue.city}</span>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {venue.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">{language === 'fi' ? 'Varaukset' : 'Bookings'}</p>
                              <p className="text-lg">{venue.bookings}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">{language === 'fi' ? 'Tulot' : 'Revenue'}</p>
                              <p className="text-lg">{venue.revenue}€</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm">{venue.rating}</span>
                              <span className="text-sm text-gray-600 ml-2">{venue.price}€/h</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedVenue(venue);
                                  setVenueFormData({
                                    name: venue.name,
                                    type: venue.type,
                                    city: venue.city,
                                    capacity: venue.capacity,
                                    price: venue.price,
                                    description: venue.description || '',
                                    amenities: '',
                                    status: venue.status
                                  });
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.bookings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{booking.venueName}</p>
                          <p className="text-sm text-gray-600">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">ID: {booking.id}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{booking.date}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg">{booking.price}€</span>
                        {getStatusBadge(booking.status)}
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            {t.viewDetails}
                          </Button>
                          {booking.status === 'pending' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              {language === 'fi' ? 'Hyväksy' : 'Approve'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t.analytics}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg mb-4">{language === 'fi' ? 'Kuukausittaiset tulot' : 'Monthly Revenue'}</h3>
                      <div className="h-32 bg-pink-100 rounded flex items-end justify-center">
                        <p className="text-gray-600">{language === 'fi' ? 'Kaavio tulossa' : 'Chart coming soon'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg mb-4">{language === 'fi' ? 'Suosituimmat tilat' : 'Most Popular Venues'}</h3>
                      <div className="space-y-2">
                        {adminVenues.slice(0, 3).map((venue, index) => (
                          <div key={venue.id} className="flex items-center justify-between">
                            <span className="text-sm">{venue.name}</span>
                            <span className="text-sm text-gray-600">{venue.bookings} {language === 'fi' ? 'varausta' : 'bookings'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;