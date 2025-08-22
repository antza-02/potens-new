import React from 'react';
import { MapPin, Building, Users, TrendingUp, Calendar, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import CityOwnerDashboard from './CityOwnerDashboard';

interface CityDashboardAccessProps {
  userRole: 'super_admin' | 'city_owner' | 'user';
  language: string;
  cityName?: string;
  onBack: () => void;
}

export default function CityDashboardAccess({ 
  userRole, 
  language, 
  cityName = 'Helsinki',
  onBack 
}: CityDashboardAccessProps) {
  // Check if user has access to City Dashboard
  const hasAccess = userRole === 'super_admin' || userRole === 'city_owner';

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {language === 'fi' ? 'Pääsy estetty' : 'Access Denied'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {language === 'fi' 
                ? 'Sinulla ei ole oikeutta käyttää kaupungin hallintapaneelia.' 
                : 'You do not have permission to access the city management dashboard.'
              }
            </p>
            <Button onClick={onBack} className="w-full">
              {language === 'fi' ? 'Takaisin' : 'Go Back'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has access, show the City Owner Dashboard
  return (
    <CityOwnerDashboard
      onBack={onBack}
      language={language}
      cityName={cityName}
    />
  );
}
