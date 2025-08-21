import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Users, Clock, Wifi, Car, Coffee, Shield, Heart, Share, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

const VenueDetail = ({ venue, onBack, onBook, language }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const translations = {
    fi: {
      back: "Takaisin",
      bookNow: "Varaa nyt",
      about: "Tietoja tilasta",
      amenities: "Mukavuudet",
      location: "Sijainti",
      availability: "Saatavuus",
      reviews: "Arvostelut",
      share: "Jaa",
      favorite: "Suosikki",
      perHour: "/ tunti",
      maxPeople: "henkilöä max",
      selectDate: "Valitse päivä",
      selectTime: "Valitse aika",
      availableSlots: "Vapaat ajat",
      rules: "Säännöt ja rajoitukset"
    },
    en: {
      back: "Back",
      bookNow: "Book Now",
      about: "About this space",
      amenities: "Amenities",
      location: "Location",
      availability: "Availability",
      reviews: "Reviews",
      share: "Share",
      favorite: "Favorite",
      perHour: "/ hour",
      maxPeople: "people max",
      selectDate: "Select date",
      selectTime: "Select time",
      availableSlots: "Available times",
      rules: "Rules and restrictions"
    }
  };

  const t = translations[language];

  // Mock gallery images
  const galleryImages = [
    venue.image,
    venue.image + " interior",
    venue.image + " exterior",
    venue.image + " equipment"
  ];

  // Mock available time slots
  const availableSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Mock reviews
  const reviews = [
    {
      id: 1,
      name: "Marja K.",
      rating: 5,
      date: "2024-01-15",
      comment: language === 'fi' 
        ? "Erinomainen sauna! Siisti ja hyvin varusteltu."
        : "Excellent sauna! Clean and well-equipped."
    },
    {
      id: 2,
      name: "Jukka M.",
      rating: 4,
      date: "2024-01-10",
      comment: language === 'fi'
        ? "Hyvä sijainti ja helppo varata. Suosittelen!"
        : "Great location and easy to book. Recommend!"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      onBook();
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={onBack} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-2" />
                {t.share}
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                {t.favorite}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={`https://images.unsplash.com/search/photos?query=${galleryImages[currentImageIndex]}&w=800&h=400&fit=crop`}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {galleryImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Venue Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl mb-2">{venue.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{venue.city}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{venue.capacity} {t.maxPeople}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{venue.rating} ({venue.reviews} {translations[language].reviews})</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-pink-600 text-white text-lg px-3 py-1">
                  {venue.type}
                </Badge>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed">{venue.description}</p>
            </div>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl mb-4">{t.amenities}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                        {amenity.includes('WiFi') && <Wifi className="h-4 w-4 text-pink-600" />}
                        {amenity.includes('Coffee') && <Coffee className="h-4 w-4 text-pink-600" />}
                        {amenity.includes('Parking') && <Car className="h-4 w-4 text-pink-600" />}
                        {!amenity.includes('WiFi') && !amenity.includes('Coffee') && !amenity.includes('Parking') && 
                          <Shield className="h-4 w-4 text-pink-600" />}
                      </div>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl mb-4">{t.rules}</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>• {language === 'fi' ? 'Varaus on sitova ja maksullinen' : 'Booking is binding and paid'}</li>
                  <li>• {language === 'fi' ? 'Peruutus vähintään 24h etukäteen' : 'Cancellation at least 24h in advance'}</li>
                  <li>• {language === 'fi' ? 'Jätä tila siistiksi käytön jälkeen' : 'Leave the space clean after use'}</li>
                  <li>• {language === 'fi' ? 'Maksimiosallistujamäärää tulee noudattaa' : 'Maximum number of participants must be observed'}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl mb-4">{t.reviews}</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-sm text-pink-600">{review.name.charAt(0)}</span>
                          </div>
                          <span>{review.name}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-3xl">{venue.price}€</span>
                    <span className="text-gray-600">{t.perHour}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm mb-2">{t.selectDate}</label>
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm mb-2">{t.availableSlots}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 text-sm border rounded-md transition-colors ${
                              selectedTime === time
                                ? 'bg-pink-600 text-white border-pink-600'
                                : 'border-gray-200 hover:border-pink-300'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full h-12 text-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    {t.bookNow}
                  </Button>

                  {selectedDate && selectedTime && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-center text-sm">
                        <span>{language === 'fi' ? 'Päivä' : 'Date'}:</span>
                        <span>{selectedDate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span>{language === 'fi' ? 'Aika' : 'Time'}:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1 pt-2 border-t">
                        <span>{language === 'fi' ? 'Yhteensä' : 'Total'}:</span>
                        <span className="font-semibold">{venue.price}€</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    {language === 'fi' 
                      ? 'Maksu suoritetaan varauksen yhteydessä'
                      : 'Payment is made during booking'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;