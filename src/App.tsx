import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Star, Heart, Menu, Globe } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardFooter } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import VenueDetail from './components/VenueDetail';
import BookingFlow from './components/BookingFlow';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

// Mock data
const featuredVenues = [
  {
    id: 1,
    name: "Keskuspuiston Sauna",
    type: "Sauna",
    city: "Helsinki",
    price: 25,
    rating: 4.8,
    reviews: 124,
    image: "helsinki sauna wooden interior",
    amenities: ["Towels provided", "Changing room", "Shower"],
    capacity: 8,
    description: "Traditional Finnish sauna in the heart of Central Park"
  },
  {
    id: 2,
    name: "Kaupungintalon Kokoushuone",
    type: "Meeting Room",
    city: "Tampere",
    price: 45,
    rating: 4.6,
    reviews: 89,
    image: "modern meeting room finland",
    amenities: ["Projector", "WiFi", "Whiteboard", "Coffee machine"],
    capacity: 12,
    description: "Modern meeting room with all necessary equipment"
  },
  {
    id: 3,
    name: "Urheilupuiston Tenniskenttä",
    type: "Tennis Court",
    city: "Turku",
    price: 35,
    rating: 4.7,
    reviews: 156,
    image: "tennis court outdoor finland",
    amenities: ["Equipment rental", "Lighting", "Seating area"],
    capacity: 4,
    description: "Professional outdoor tennis court with evening lighting"
  },
  {
    id: 4,
    name: "Kulttuuritalon Studiotila",
    type: "Creative Space",
    city: "Oulu",
    price: 30,
    rating: 4.9,
    reviews: 67,
    image: "creative studio space finland",
    amenities: ["Sound system", "Mirrors", "Storage", "Piano"],
    capacity: 20,
    description: "Versatile creative space perfect for workshops and events"
  }
];

const cities = ["Helsinki", "Tampere", "Turku", "Oulu", "Espoo", "Vantaa"];
const spaceTypes = ["Sauna", "Meeting Room", "Tennis Court", "Creative Space", "Sports Hall", "Conference Room"];

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [language, setLanguage] = useState('fi');

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
      menu: "Valikko"
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
      menu: "Menu"
    }
  };

  const t = translations[language];

  const filteredVenues = featuredVenues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = !selectedCity || venue.city === selectedCity;
    const matchesType = !selectedType || venue.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setCurrentView('venue');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fi' ? 'en' : 'fi');
  };

  if (currentView === 'venue' && selectedVenue) {
    return <VenueDetail 
      venue={selectedVenue} 
      onBack={() => setCurrentView('home')} 
      onBook={() => setCurrentView('booking')}
      language={language}
    />;
  }

  if (currentView === 'booking') {
    return <BookingFlow 
      venue={selectedVenue} 
      onBack={() => setCurrentView('venue')}
      language={language}
    />;
  }

  if (currentView === 'dashboard') {
    return <UserDashboard 
      onBack={() => setCurrentView('home')}
      language={language}
    />;
  }

  if (currentView === 'admin') {
    return <AdminDashboard 
      onBack={() => setCurrentView('home')}
      language={language}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl text-pink-600 mr-8">Potens</h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => setCurrentView('home')}
                  className={`${currentView === 'home' ? 'text-pink-600' : 'text-gray-700'} hover:text-pink-600`}
                >
                  {t.home}
                </button>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`${currentView === 'dashboard' ? 'text-pink-600' : 'text-gray-700'} hover:text-pink-600`}
                >
                  {t.bookings}
                </button>
                <button 
                  onClick={() => setCurrentView('admin')}
                  className={`${currentView === 'admin' ? 'text-pink-600' : 'text-gray-700'} hover:text-pink-600`}
                >
                  {t.admin}
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
              >
                <Globe className="h-4 w-4" />
                <span>{language.toUpperCase()}</span>
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => {setCurrentView('home'); setShowMobileMenu(false);}}
                  className={`text-left py-2 ${currentView === 'home' ? 'text-pink-600' : 'text-gray-700'}`}
                >
                  {t.home}
                </button>
                <button 
                  onClick={() => {setCurrentView('dashboard'); setShowMobileMenu(false);}}
                  className={`text-left py-2 ${currentView === 'dashboard' ? 'text-pink-600' : 'text-gray-700'}`}
                >
                  {t.bookings}
                </button>
                <button 
                  onClick={() => {setCurrentView('admin'); setShowMobileMenu(false);}}
                  className={`text-left py-2 ${currentView === 'admin' ? 'text-pink-600' : 'text-gray-700'}`}
                >
                  {t.admin}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-pink-50 to-rose-100 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl text-gray-900 mb-6">
            {language === 'fi' ? 'Varaa julkisia tiloja helposti' : 'Book public spaces easily'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {language === 'fi' 
              ? 'Löydä ja varaa saunoja, kokoushuoneita, urheilutiloja ja muita julkisia tiloja kaupungeista ympäri Suomen'
              : 'Find and book saunas, meeting rooms, sports facilities and other public spaces from cities across Finland'
            }
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-pink-500"
                    />
                  </div>
                </div>
                
                <div>
                  <select 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
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
                    className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
                  >
                    <option value="">{t.anyType}</option>
                    {spaceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Button className="w-full lg:w-auto mt-4 lg:mt-6 h-12 px-8 bg-pink-600 hover:bg-pink-700">
                <Search className="h-5 w-5 mr-2" />
                {t.search}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spaces */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-gray-900 mb-8">{t.featuredSpaces}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard 
                key={venue.id} 
                venue={venue} 
                onClick={() => handleVenueClick(venue)}
                language={language}
                t={t}
              />
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {language === 'fi' ? 'Ei tuloksia hakuehdoillasi' : 'No results found for your search criteria'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl mb-4">Potens</h3>
              <p className="text-gray-400">
                {language === 'fi' 
                  ? 'Julkisten tilojen varauspalvelu Suomen kaupungeille'
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

function VenueCard({ venue, onClick, language, t }) {
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