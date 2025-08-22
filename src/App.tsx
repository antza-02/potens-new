import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Star, Heart, Menu, Globe, LogOut, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardFooter } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import VenueDetail from './components/VenueDetail';
import BookingFlow from './components/BookingFlow';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CityDashboardAccess from './components/CityDashboardAccess';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { getVenues, searchVenues, Venue } from './lib/database';
import { useUserProfile } from './hooks/useUserProfile';


const cities = ["Helsinki", "Tampere", "Turku", "Oulu", "Espoo", "Vantaa"];
const spaceTypes = ["Sauna", "Meeting Room", "Tennis Court", "Creative Space", "Sports Hall", "Conference Room"];

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const { profile, isSuperAdmin, isAdmin, loading: profileLoading } = useUserProfile();
  const [currentView, setCurrentView] = useState('home');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [language, setLanguage] = useState('fi');
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  const translations = {
    fi: {
      searchPlaceholder: "Etsi tiloja, saunoja, kenttia...",
      anyCity: "Kaikki kaupungit",
      anyType: "Kaikki tilat",
      search: "Hae",
      featuredSpaces: "Suositellut tilat",
      viewDetails: "Katso tiedot",
      perHour: "/ tunti",
      reviews: "arvostelua",
      home: "Etusivu",
      bookings: "Varaukseni",
      admin: "Hallinta",
      menu: "Valikko",
      login: "Kirjaudu",
      logout: "Kirjaudu ulos",
      profile: "Profiili"
    },
    en: {
      searchPlaceholder: "Search spaces, saunas, courts...",
      anyCity: "All cities",
      anyType: "All spaces",
      search: "Search",
      featuredSpaces: "Featured Spaces",
      viewDetails: "View Details",
      perHour: "/ hour",
      reviews: "reviews",
      home: "Home",
      bookings: "My Bookings",
      admin: "Admin",
      menu: "Menu",
      login: "Login",
      logout: "Logout",
      profile: "Profile"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Load venues from database
  useEffect(() => {
    const loadVenues = async () => {
      setLoadingVenues(true);
      try {
        const venuesData = await getVenues();
        setVenues(venuesData);
      } catch (error) {
        console.error('Error loading venues:', error);
      } finally {
        setLoadingVenues(false);
      }
    };

    loadVenues();
  }, []);

  // Handle search
  const handleSearch = async () => {
    setLoadingVenues(true);
    try {
      const searchResults = await searchVenues(searchQuery, selectedCity || undefined, selectedType || undefined);
      setVenues(searchResults);
    } catch (error) {
      console.error('Error searching venues:', error);
    } finally {
      setLoadingVenues(false);
    }
  };

  // Handle venue selection
  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setCurrentView('venue-detail');
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    setCurrentView('home');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ladataan...</p>
        </div>
      </div>
    );
  }

  // Show authentication forms
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showAuth === 'login' ? (
            <LoginForm onSwitchToSignUp={() => setShowAuth('signup')} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setShowAuth('login')} />
          )}
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAuth(null)}
              className="w-full"
            >
              Takaisin sovellukseen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show specific views
  if (currentView === 'venue-detail' && selectedVenue) {
    return (
      <VenueDetail
        venue={selectedVenue}
        onBack={() => setCurrentView('home')}
        onBook={() => setCurrentView('booking')}
        language={language}
      />
    );
  }

  if (currentView === 'booking' && selectedVenue) {
    return (
      <BookingFlow
        venue={selectedVenue}
        onBack={() => setCurrentView('venue-detail')}
        onComplete={() => setCurrentView('user-dashboard')}
        language={language}
      />
    );
  }

  if (currentView === 'user-dashboard') {
    return (
      <UserDashboard
        onBack={() => setCurrentView('home')}
        language={language}
      />
    );
  }

  if (currentView === 'admin-dashboard') {
    return (
      <AdminDashboard
        onBack={() => setCurrentView('home')}
        language={language}
        onNavigateToCityDashboard={() => setCurrentView('city-dashboard')}
      />
    );
  }

  if (currentView === 'super-admin-dashboard') {
    return (
      <SuperAdminDashboard
        onBack={() => setCurrentView('home')}
        language={language}
        onNavigateToCityDashboard={() => setCurrentView('city-dashboard')}
      />
    );
  }

  if (currentView === 'city-dashboard') {
    return (
      <CityDashboardAccess
        userRole={isSuperAdmin ? 'super_admin' : (isAdmin ? 'city_owner' : 'user')}
        language={language}
        cityName="Helsinki"
        onBack={() => setCurrentView('home')}
      />
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Potens</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'fi' ? 'en' : 'fi')}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'fi' ? 'EN' : 'FI'}</span>
              </button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('user-dashboard')}
                  >
                    {t.bookings}
                  </Button>
                                                          {isAdmin && (
                     <Button
                       variant="outline"
                       onClick={() => setCurrentView('admin-dashboard')}
                     >
                       {t.admin}
                     </Button>
                   )}
                   {(isSuperAdmin || user?.user_metadata?.role === 'super_admin' || user?.email === 'superadmin@potens.fi' || user?.email === 'anton.hietsilta@gmail.com') && (
                     <Button
                       variant="outline"
                       onClick={() => setCurrentView('super-admin-dashboard')}
                     >
                       Super Admin
                     </Button>
                   )}
                   {(isSuperAdmin || isAdmin) && (
                     <Button
                       variant="outline"
                       onClick={() => setCurrentView('city-dashboard')}
                     >
                       {language === 'fi' ? 'Kaupungin Hallinta' : 'City Dashboard'}
                     </Button>
                   )}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.logout}</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuth('login')}>
                  {t.login}
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setLanguage(language === 'fi' ? 'en' : 'fi')}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  <Globe className="h-4 w-4" />
                  <span>{language === 'fi' ? 'EN' : 'FI'}</span>
                </button>
                
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentView('user-dashboard');
                        setShowMobileMenu(false);
                      }}
                      className="justify-start"
                    >
                      {t.bookings}
                    </Button>
                                         {isAdmin && (
                       <Button
                         variant="outline"
                         onClick={() => {
                           setCurrentView('admin-dashboard');
                           setShowMobileMenu(false);
                         }}
                         className="justify-start"
                       >
                         {t.admin}
                       </Button>
                     )}
                     {(isSuperAdmin || user?.user_metadata?.role === 'super_admin' || user?.email === 'superadmin@potens.fi' || user?.email === 'anton.hietsilta@gmail.com') && (
                       <Button
                         variant="outline"
                         onClick={() => {
                           setCurrentView('super-admin-dashboard');
                           setShowMobileMenu(false);
                         }}
                         className="justify-start"
                       >
                         Super Admin
                       </Button>
                       )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="justify-start"
                    >
                      {t.logout}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setShowAuth('login');
                      setShowMobileMenu(false);
                    }}
                  >
                    {t.login}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.anyCity}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.anyType}</option>
                  {spaceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                {t.search}
              </Button>
            </div>
          </div>
        </div>

        {/* Venues grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.featuredSpaces}</h2>
          
          {loadingVenues ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {venues.map(venue => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onClick={() => handleVenueClick(venue)}
                  language={language}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Ei tiloja löytynyt</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="mb-4 font-semibold">Potens</h4>
              <p className="text-gray-400">
                {language === 'fi' 
                  ? 'Suomalaisten kaupunkien julkisten tilojen varauspalvelu'
                  : 'Public space booking service for Finnish cities'
                }
              </p>
            </div>
            <div>
              <h4 className="mb-4">
                {language === 'fi' ? 'Palvelut' : 'Services'}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>{language === 'fi' ? 'Sauna varaukset' : 'Sauna bookings'}</li>
                <li>{language === 'fi' ? 'Kokoushuoneet' : 'Meeting rooms'}</li>
                <li>{language === 'fi' ? 'Urheilutilat' : 'Sports facilities'}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">
                {language === 'fi' ? 'Tuki' : 'Support'}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>{language === 'fi' ? 'Yhteystiedot' : 'Contact'}</li>
                <li>{language === 'fi' ? 'Usein kysytyt kysymykset' : 'FAQ'}</li>
                <li>{language === 'fi' ? 'Käyttöehdot' : 'Terms of Service'}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">
                {language === 'fi' ? 'Kaupungit' : 'Cities'}
              </h4>
              <ul className="space-y-2 text-gray-400">
                {cities.slice(0, 4).map(city => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Potens. {language === 'fi' ? 'Kaikki oikeudet pidätetään.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
      

    </div>
  );
}

function VenueCard({ venue, onClick, language, t }: { venue: Venue; onClick: () => void; language: string; t: any }) {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}>
      <div className="relative overflow-hidden rounded-t-lg">
        <ImageWithFallback
          src={`https://images.unsplash.com/search/photos?query=${venue.image}&w=400&h=240&fit=crop`}
          alt={venue.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
        <Badge className="absolute top-3 left-3 bg-pink-600 text-white">
          {venue.type}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg truncate mr-2">{venue.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{venue.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{venue.city}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {language === 'fi' ? `Maksimi ${venue.capacity} henkilöä` : `Max ${venue.capacity} people`}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{venue.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {venue.amenities.slice(0, 2).map((amenity, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <span className="text-lg">{venue.price}€</span>
          <span className="text-gray-600 text-sm">{t.perHour}</span>
        </div>
        <div className="text-sm text-gray-500">
          {venue.reviews} {t.reviews}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}