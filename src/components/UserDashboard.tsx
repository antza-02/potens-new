import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Star, Heart, Settings, Bell, CreditCard, User, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

const UserDashboard = ({ onBack, language }) => {
  const [activeTab, setActiveTab] = useState('bookings');

  const translations = {
    fi: {
      back: "Takaisin",
      myBookings: "Omat varaukset",
      favorites: "Suosikit",
      profile: "Profiili",
      upcomingBookings: "Tulevat varaukset",
      pastBookings: "Menneet varaukset",
      noUpcoming: "Ei tulevia varauksia",
      noPast: "Ei menneitä varauksia",
      cancel: "Peruuta",
      reschedule: "Siirrä",
      review: "Arvostele",
      viewDetails: "Näytä tiedot",
      bookingId: "Varausnumero",
      confirmed: "Vahvistettu",
      cancelled: "Peruutettu",
      completed: "Suoritettu",
      noFavorites: "Ei suosikkeja",
      personalInfo: "Henkilötiedot",
      name: "Nimi",
      email: "Sähköposti",
      phone: "Puhelin",
      edit: "Muokkaa",
      save: "Tallenna",
      notifications: "Ilmoitukset",
      emailNotifications: "Sähköposti-ilmoitukset",
      smsNotifications: "SMS-ilmoitukset",
      paymentMethods: "Maksutavat",
      addPaymentMethod: "Lisää maksutapa"
    },
    en: {
      back: "Back",
      myBookings: "My Bookings",
      favorites: "Favorites",
      profile: "Profile",
      upcomingBookings: "Upcoming Bookings",
      pastBookings: "Past Bookings",
      noUpcoming: "No upcoming bookings",
      noPast: "No past bookings",
      cancel: "Cancel",
      reschedule: "Reschedule",
      review: "Review",
      viewDetails: "View Details",
      bookingId: "Booking ID",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
      noFavorites: "No favorites yet",
      personalInfo: "Personal Information",
      name: "Name",
      email: "Email",
      phone: "Phone",
      edit: "Edit",
      save: "Save",
      notifications: "Notifications",
      emailNotifications: "Email Notifications",
      smsNotifications: "SMS Notifications",
      paymentMethods: "Payment Methods",
      addPaymentMethod: "Add Payment Method"
    }
  };

  const t = translations[language];

  // Mock bookings data
  const upcomingBookings = [
    {
      id: 'POT123456',
      venue: {
        id: 1,
        name: "Keskuspuiston Sauna",
        type: "Sauna",
        city: "Helsinki",
        image: "helsinki sauna wooden interior"
      },
      date: "2024-02-15",
      time: "14:00-15:00",
      participants: 4,
      price: 25,
      status: "confirmed"
    },
    {
      id: 'POT123457',
      venue: {
        id: 2,
        name: "Kaupungintalon Kokoushuone",
        type: "Meeting Room",
        city: "Tampere",
        image: "modern meeting room finland"
      },
      date: "2024-02-20",
      time: "10:00-12:00",
      participants: 8,
      price: 90,
      status: "confirmed"
    }
  ];

  const pastBookings = [
    {
      id: 'POT123455',
      venue: {
        id: 3,
        name: "Urheilupuiston Tenniskenttä",
        type: "Tennis Court",
        city: "Turku",
        image: "tennis court outdoor finland"
      },
      date: "2024-01-10",
      time: "16:00-17:00",
      participants: 2,
      price: 35,
      status: "completed",
      rating: 5
    }
  ];

  const favoriteVenues = [
    {
      id: 1,
      name: "Keskuspuiston Sauna",
      type: "Sauna",
      city: "Helsinki",
      price: 25,
      rating: 4.8,
      image: "helsinki sauna wooden interior"
    },
    {
      id: 4,
      name: "Kulttuuritalon Studiotila",
      type: "Creative Space",
      city: "Oulu",
      price: 30,
      rating: 4.9,
      image: "creative studio space finland"
    }
  ];

  const [profileData, setProfileData] = useState({
    name: "Matti Meikäläinen",
    email: "matti@example.com",
    phone: "+358 40 123 4567",
    emailNotifications: true,
    smsNotifications: false
  });

  const [isEditing, setIsEditing] = useState(false);

  const getStatusBadge = (status) => {
    const statusColors = {
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-pink-100 text-pink-800"
    };
    
    const statusTexts = {
      confirmed: t.confirmed,
      cancelled: t.cancelled,
      completed: t.completed
    };

    return (
      <Badge className={statusColors[status]}>
        {statusTexts[status]}
      </Badge>
    );
  };

  const BookingCard = ({ booking, isPast = false }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <ImageWithFallback
            src={`https://images.unsplash.com/search/photos?query=${booking.venue.image}&w=100&h=80&fit=crop`}
            alt={booking.venue.name}
            className="w-20 h-16 object-cover rounded-md flex-shrink-0"
          />
          
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg truncate">{booking.venue.name}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{booking.venue.city}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {booking.venue.type}
                  </Badge>
                </div>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{booking.time}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span>{t.bookingId}: {booking.id}</span>
                <span className="ml-4">{booking.price}€</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isPast && (
                  <>
                    <Button variant="outline" size="sm">
                      {t.reschedule}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      {t.cancel}
                    </Button>
                  </>
                )}
                
                {isPast && !booking.rating && (
                  <Button variant="outline" size="sm">
                    {t.review}
                  </Button>
                )}
                
                {isPast && booking.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">{booking.rating}</span>
                  </div>
                )}
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FavoriteCard = ({ venue }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <ImageWithFallback
            src={`https://images.unsplash.com/search/photos?query=${venue.image}&w=100&h=80&fit=crop`}
            alt={venue.name}
            className="w-20 h-16 object-cover rounded-md flex-shrink-0"
          />
          
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-2">
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
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm">{venue.rating}</span>
                <span className="text-sm text-gray-600 ml-2">{venue.price}€/h</span>
              </div>
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                {language === 'fi' ? 'Varaa' : 'Book'}
              </Button>
            </div>
          </div>
        </div>
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
              <h1 className="text-2xl">{t.myBookings}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="bookings">{t.myBookings}</TabsTrigger>
            <TabsTrigger value="favorites">{t.favorites}</TabsTrigger>
            <TabsTrigger value="profile">{t.profile}</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6 mt-6">
            {/* Upcoming Bookings */}
            <div>
              <h2 className="text-xl mb-4">{t.upcomingBookings}</h2>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t.noUpcoming}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h2 className="text-xl mb-4">{t.pastBookings}</h2>
              {pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} isPast={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t.noPast}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <h2 className="text-xl mb-4">{t.favorites}</h2>
            {favoriteVenues.length > 0 ? (
              <div className="space-y-4">
                {favoriteVenues.map((venue) => (
                  <FavoriteCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t.noFavorites}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {t.personalInfo}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? t.save : t.edit}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.name}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                      className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
                    />
                  ) : (
                    <p>{profileData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.email}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                      className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
                    />
                  ) : (
                    <p>{profileData.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.phone}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                      className="w-full p-2 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
                    />
                  ) : (
                    <p>{profileData.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {t.notifications}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t.emailNotifications}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.emailNotifications}
                      onChange={(e) => setProfileData(prev => ({...prev, emailNotifications: e.target.checked}))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{t.smsNotifications}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.smsNotifications}
                      onChange={(e) => setProfileData(prev => ({...prev, smsNotifications: e.target.checked}))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t.paymentMethods}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                      <span>•••• •••• •••• 1234</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  {t.addPaymentMethod}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;