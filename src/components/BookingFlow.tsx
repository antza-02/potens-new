import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CreditCard, Shield, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

const BookingFlow = ({ venue, onBack, language }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    participants: 1,
    specialRequests: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    bookingId: null
  });

  const translations = {
    fi: {
      back: "Takaisin",
      bookingDetails: "Varauksen tiedot",
      paymentInfo: "Maksu",
      confirmation: "Vahvistus",
      yourDetails: "Sinun tietosi",
      fullName: "Koko nimi",
      email: "Sähköposti",
      phone: "Puhelinnumero",
      participants: "Osallistujien määrä",
      specialRequests: "Erityistoiveet",
      bookingSummary: "Varauksen yhteenveto",
      paymentMethod: "Maksutapa",
      creditCard: "Maksukortti",
      mobilePay: "MobilePay",
      bankTransfer: "Tilisiirto",
      cardNumber: "Kortin numero",
      expiryDate: "Viimeinen voimassaolo",
      cvv: "CVV",
      securePayment: "Turvallinen maksu",
      continueToPayment: "Jatka maksuun",
      completeBooking: "Viimeistele varaus",
      bookingConfirmed: "Varaus vahvistettu!",
      bookingId: "Varausnumero",
      confirmationEmail: "Vahvistus lähetetty sähköpostiin",
      returnHome: "Palaa etusivulle",
      totalPrice: "Kokonaishinta",
      perHour: "/ tunti",
      date: "Päivä",
      time: "Aika",
      location: "Paikka",
      required: "Pakollinen"
    },
    en: {
      back: "Back",
      bookingDetails: "Booking Details",
      paymentInfo: "Payment",
      confirmation: "Confirmation",
      yourDetails: "Your Details",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      participants: "Number of Participants",
      specialRequests: "Special Requests",
      bookingSummary: "Booking Summary",
      paymentMethod: "Payment Method",
      creditCard: "Credit Card",
      mobilePay: "MobilePay",
      bankTransfer: "Bank Transfer",
      cardNumber: "Card Number",
      expiryDate: "Expiry Date",
      cvv: "CVV",
      securePayment: "Secure Payment",
      continueToPayment: "Continue to Payment",
      completeBooking: "Complete Booking",
      bookingConfirmed: "Booking Confirmed!",
      bookingId: "Booking ID",
      confirmationEmail: "Confirmation sent to email",
      returnHome: "Return to Home",
      totalPrice: "Total Price",
      perHour: "/ hour",
      date: "Date",
      time: "Time",
      location: "Location",
      required: "Required"
    }
  };

  const t = translations[language];

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate required fields
      if (!bookingData.name || !bookingData.email || !bookingData.phone) {
        alert(language === 'fi' ? 'Täytä kaikki pakolliset kentät' : 'Please fill all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Simulate payment processing
      const bookingId = 'POT' + Date.now().toString().slice(-6);
      setBookingData(prev => ({ ...prev, bookingId }));
      setStep(3);
    }
  };

  const stepTitles = [t.bookingDetails, t.paymentInfo, t.confirmation];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="flex items-center mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                    step > index + 1 ? 'bg-green-600 text-white' :
                    step === index + 1 ? 'bg-pink-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${step === index + 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                    {title}
                  </span>
                  {index < stepTitles.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.yourDetails}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2">
                      {t.fullName} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={bookingData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={language === 'fi' ? 'Matti Meikäläinen' : 'John Doe'}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">
                      {t.email} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="matti@example.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+358 40 123 4567"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">{t.participants}</label>
                    <select
                      value={bookingData.participants}
                      onChange={(e) => handleInputChange('participants', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none"
                    >
                      {[...Array(venue.capacity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">{t.specialRequests}</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder={language === 'fi' ? 'Erityistoiveet tai lisätiedot...' : 'Special requests or additional information...'}
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-md focus:border-pink-500 focus:outline-none resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    {t.securePayment}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm mb-3">{t.paymentMethod}</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={bookingData.paymentMethod === 'card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-3"
                        />
                        <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                        {t.creditCard}
                      </label>
                      <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mobilepay"
                          checked={bookingData.paymentMethod === 'mobilepay'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-3"
                        />
                        <div className="w-5 h-5 mr-2 bg-pink-600 rounded"></div>
                        {t.mobilePay}
                      </label>
                    </div>
                  </div>

                  {bookingData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2">{t.cardNumber}</label>
                        <Input
                          value={bookingData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-2">{t.expiryDate}</label>
                          <Input
                            value={bookingData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            placeholder="MM/YY"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">{t.cvv}</label>
                          <Input
                            value={bookingData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingData.paymentMethod === 'mobilepay' && (
                    <div className="bg-pink-50 p-4 rounded-md">
                      <p className="text-sm text-pink-800">
                        {language === 'fi' 
                          ? 'Sinut ohjataan MobilePay-sovellukseen maksun suorittamiseksi.'
                          : 'You will be redirected to the MobilePay app to complete the payment.'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <h1 className="text-2xl mb-2">{t.bookingConfirmed}</h1>
                  <p className="text-gray-600 mb-6">{t.confirmationEmail}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-600 mr-2">{t.bookingId}:</span>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {bookingData.bookingId}
                      </Badge>
                    </div>
                  </div>

                  <Button onClick={onBack} className="bg-pink-600 hover:bg-pink-700">
                    {t.returnHome}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t.bookingSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <ImageWithFallback
                    src={`https://images.unsplash.com/search/photos?query=${venue.image}&w=300&h=200&fit=crop`}
                    alt={venue.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Badge className="absolute top-2 left-2 bg-pink-600 text-white">
                    {venue.type}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-lg mb-2">{venue.name}</h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{venue.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{bookingData.participants} {language === 'fi' ? 'henkilöä' : 'people'}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {t.date}:
                    </span>
                    <span>2024-02-15</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {t.time}:
                    </span>
                    <span>14:00-15:00</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">1h × {venue.price}€</span>
                    <span>{venue.price}€</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span>{t.totalPrice}:</span>
                    <span className="text-pink-600">{venue.price}€</span>
                  </div>
                </div>
                
                {step < 3 && (
                  <Button 
                    onClick={handleNextStep}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {step === 1 ? t.continueToPayment : t.completeBooking}
                  </Button>
                )}
                
                <div className="text-xs text-gray-500 text-center">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  {language === 'fi' 
                    ? 'Peruutus ilmaiseksi 24h ennen varausta'
                    : 'Free cancellation 24h before booking'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;