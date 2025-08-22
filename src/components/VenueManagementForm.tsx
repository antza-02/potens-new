import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  DollarSign, 
  FileText, 
  Upload, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Image as ImageIcon,
  Settings,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VenueFormData {
  name: string;
  type: string;
  city: string;
  address: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive' | 'maintenance';
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  rules: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  features: {
    wheelchairAccessible: boolean;
    parkingAvailable: boolean;
    wifiAvailable: boolean;
    airConditioning: boolean;
    heating: boolean;
    soundSystem: boolean;
    projector: boolean;
    whiteboard: boolean;
    kitchen: boolean;
    bathroom: boolean;
    changingRoom: boolean;
    shower: boolean;
    towels: boolean;
    equipment: boolean;
  };
}

interface VenueManagementFormProps {
  venue?: Partial<VenueFormData>;
  mode: 'create' | 'edit';
  onSave: (data: VenueFormData) => void;
  onCancel: () => void;
  language: string;
}

const defaultVenueData: VenueFormData = {
  name: '',
  type: 'Sauna',
  city: 'Helsinki',
  address: '',
  price: 25,
  capacity: 1,
  description: '',
  amenities: [],
  images: [],
  status: 'active',
  openingHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: false }
  },
  rules: [],
  contactInfo: {
    phone: '',
    email: '',
    website: ''
  },
  location: {
    latitude: 60.1699,
    longitude: 24.9384
  },
  features: {
    wheelchairAccessible: false,
    parkingAvailable: false,
    wifiAvailable: false,
    airConditioning: false,
    heating: false,
    soundSystem: false,
    projector: false,
    whiteboard: false,
    kitchen: false,
    bathroom: false,
    changingRoom: false,
    shower: false,
    towels: false,
    equipment: false
  }
};

export default function VenueManagementForm({ 
  venue, 
  mode, 
  onSave, 
  onCancel, 
  language 
}: VenueManagementFormProps) {
  const [formData, setFormData] = useState<VenueFormData>(defaultVenueData);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'hours' | 'features' | 'images'>('basic');
  const [newAmenity, setNewAmenity] = useState('');
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    fi: {
      createVenue: 'Luo uusi tila',
      editVenue: 'Muokkaa tilaa',
      basicInfo: 'Perustiedot',
      details: 'Yksityiskohdat',
      hours: 'Aukioloajat',
      features: 'Ominaisuudet',
      images: 'Kuvat',
      save: 'Tallenna',
      cancel: 'Peruuta',
      venueName: 'Tilan nimi',
      venueType: 'Tilan tyyppi',
      city: 'Kaupunki',
      address: 'Osoite',
      price: 'Hinta per tunti (€)',
      capacity: 'Kapasiteetti',
      description: 'Kuvaus',
      amenities: 'Mukavuudet',
      addAmenity: 'Lisää mukavuus',
      rules: 'Säännöt',
      addRule: 'Lisää sääntö',
      openingHours: 'Aukioloajat',
      monday: 'Maanantai',
      tuesday: 'Tiistai',
      wednesday: 'Keskiviikko',
      thursday: 'Torstai',
      friday: 'Perjantai',
      saturday: 'Lauantai',
      sunday: 'Sunnuntai',
      open: 'Avoinna',
      closed: 'Suljettu',
      from: 'Alkaen',
      to: 'Asti',
      features: 'Ominaisuudet',
      accessibility: 'Esteettömyys',
      parking: 'Pysäköinti',
      technology: 'Teknologia',
      facilities: 'Tilat',
      equipment: 'Varusteet',
      wheelchairAccessible: 'Esteetön',
      parkingAvailable: 'Pysäköinti saatavilla',
      wifiAvailable: 'WiFi saatavilla',
      airConditioning: 'Ilmastointi',
      heating: 'Lämmitys',
      soundSystem: 'Äänijärjestelmä',
      projector: 'Projektori',
      whiteboard: 'Taulu',
      kitchen: 'Keittiö',
      bathroom: 'WC',
      changingRoom: 'Pukuhuone',
      shower: 'Suihku',
      towels: 'Pyyhkeet',
      equipment: 'Varusteet',
      images: 'Kuvat',
      uploadImages: 'Lataa kuvia',
      dragDropImages: 'Vedä ja pudota kuvia tähän tai klikkaa valitaksesi',
      status: 'Tila',
      active: 'Aktiivinen',
      inactive: 'Ei aktiivinen',
      maintenance: 'Huolto',
      contactInfo: 'Yhteystiedot',
      phone: 'Puhelin',
      email: 'Sähköposti',
      website: 'Verkkosivusto',
      required: 'Pakollinen kenttä',
      invalidPrice: 'Virheellinen hinta',
      invalidCapacity: 'Virheellinen kapasiteetti',
      sauna: 'Sauna',
      meetingRoom: 'Kokoushuone',
      tennisCourt: 'Tenniskenttä',
      creativeSpace: 'Luova tila',
      sportsHall: 'Liikuntahalli',
      gym: 'Kuntosali',
      pool: 'Uima-allas',
      restaurant: 'Ravintola',
      eventSpace: 'Tapahtumatila'
    },
    en: {
      createVenue: 'Create New Venue',
      editVenue: 'Edit Venue',
      basicInfo: 'Basic Info',
      details: 'Details',
      hours: 'Hours',
      features: 'Features',
      images: 'Images',
      save: 'Save',
      cancel: 'Cancel',
      venueName: 'Venue Name',
      venueType: 'Venue Type',
      city: 'City',
      address: 'Address',
      price: 'Price per hour (€)',
      capacity: 'Capacity',
      description: 'Description',
      amenities: 'Amenities',
      addAmenity: 'Add amenity',
      rules: 'Rules',
      addRule: 'Add rule',
      openingHours: 'Opening Hours',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      open: 'Open',
      closed: 'Closed',
      from: 'From',
      to: 'To',
      features: 'Features',
      accessibility: 'Accessibility',
      parking: 'Parking',
      technology: 'Technology',
      facilities: 'Facilities',
      equipment: 'Equipment',
      wheelchairAccessible: 'Wheelchair accessible',
      parkingAvailable: 'Parking available',
      wifiAvailable: 'WiFi available',
      airConditioning: 'Air conditioning',
      heating: 'Heating',
      soundSystem: 'Sound system',
      projector: 'Projector',
      whiteboard: 'Whiteboard',
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      changingRoom: 'Changing room',
      shower: 'Shower',
      towels: 'Towels',
      equipment: 'Equipment',
      images: 'Images',
      uploadImages: 'Upload Images',
      dragDropImages: 'Drag and drop images here or click to select',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance',
      contactInfo: 'Contact Information',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      required: 'Required field',
      invalidPrice: 'Invalid price',
      invalidCapacity: 'Invalid capacity',
      sauna: 'Sauna',
      meetingRoom: 'Meeting Room',
      tennisCourt: 'Tennis Court',
      creativeSpace: 'Creative Space',
      sportsHall: 'Sports Hall',
      gym: 'Gym',
      pool: 'Pool',
      restaurant: 'Restaurant',
      eventSpace: 'Event Space'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (venue && mode === 'edit') {
      setFormData({ ...defaultVenueData, ...venue });
    }
  }, [venue, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof VenueFormData],
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const handleOpeningHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) return false;
    if (formData.price <= 0) return false;
    if (formData.capacity <= 0) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving venue:', error);
    } finally {
      setLoading(false);
    }
  };

  const venueTypes = [
    { value: 'Sauna', label: t.sauna },
    { value: 'Meeting Room', label: t.meetingRoom },
    { value: 'Tennis Court', label: t.tennisCourt },
    { value: 'Creative Space', label: t.creativeSpace },
    { value: 'Sports Hall', label: t.sportsHall },
    { value: 'Gym', label: t.gym },
    { value: 'Pool', label: t.pool },
    { value: 'Restaurant', label: t.restaurant },
    { value: 'Event Space', label: t.eventSpace }
  ];

  const cities = ['Helsinki', 'Tampere', 'Turku', 'Oulu', 'Espoo', 'Vantaa', 'Jyväskylä', 'Lahti'];

  const days = [
    { key: 'monday', label: t.monday },
    { key: 'tuesday', label: t.tuesday },
    { key: 'wednesday', label: t.wednesday },
    { key: 'thursday', label: t.thursday },
    { key: 'friday', label: t.friday },
    { key: 'saturday', label: t.saturday },
    { key: 'sunday', label: t.sunday }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            {mode === 'create' ? t.createVenue : t.editVenue}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 border-b">
              {[
                { id: 'basic', label: t.basicInfo, icon: Building },
                { id: 'details', label: t.details, icon: FileText },
                { id: 'hours', label: t.hours, icon: Clock },
                { id: 'features', label: t.features, icon: Settings },
                { id: 'images', label: t.images, icon: ImageIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t.venueName} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter venue name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">{t.venueType}</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {venueTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">{t.city}</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">{t.price} *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">{t.capacity} *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the venue..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="status">{t.status}</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Amenities */}
                <div>
                  <Label>{t.amenities}</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add new amenity"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      />
                      <Button type="button" onClick={addAmenity} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <Label>{t.rules}</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="Add new rule"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                      />
                      <Button type="button" onClick={addRule} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1">{rule}</span>
                          <button
                            type="button"
                            onClick={() => removeRule(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <Label className="text-lg font-medium">{t.contactInfo}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="phone">{t.phone}</Label>
                      <Input
                        id="phone"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                        placeholder="+358 40 123 4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                        placeholder="venue@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">{t.website}</Label>
                      <Input
                        id="website"
                        value={formData.contactInfo.website}
                        onChange={(e) => handleNestedChange('contactInfo', 'website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opening Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-4">
                <Label className="text-lg font-medium">{t.openingHours}</Label>
                <div className="space-y-3">
                  {days.map((day) => (
                    <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-24 font-medium">{day.label}</div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!formData.openingHours[day.key].closed}
                          onCheckedChange={(checked) => handleOpeningHoursChange(day.key, 'closed', !checked)}
                        />
                        <span className="text-sm">{formData.openingHours[day.key].closed ? t.closed : t.open}</span>
                      </div>
                      {!formData.openingHours[day.key].closed && (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{t.from}</span>
                            <Input
                              type="time"
                              value={formData.openingHours[day.key].open}
                              onChange={(e) => handleOpeningHoursChange(day.key, 'open', e.target.value)}
                              className="w-24"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{t.to}</span>
                            <Input
                              type="time"
                              value={formData.openingHours[day.key].close}
                              onChange={(e) => handleOpeningHoursChange(day.key, 'close', e.target.value)}
                              className="w-24"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accessibility */}
                  <div>
                    <Label className="text-lg font-medium">{t.accessibility}</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.wheelchairAccessible}
                          onCheckedChange={(checked) => handleFeatureChange('wheelchairAccessible', checked)}
                        />
                        <Label>{t.wheelchairAccessible}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Parking */}
                  <div>
                    <Label className="text-lg font-medium">{t.parking}</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.parkingAvailable}
                          onCheckedChange={(checked) => handleFeatureChange('parkingAvailable', checked)}
                        />
                        <Label>{t.parkingAvailable}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Technology */}
                  <div>
                    <Label className="text-lg font-medium">{t.technology}</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.wifiAvailable}
                          onCheckedChange={(checked) => handleFeatureChange('wifiAvailable', checked)}
                        />
                        <Label>{t.wifiAvailable}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.soundSystem}
                          onCheckedChange={(checked) => handleFeatureChange('soundSystem', checked)}
                        />
                        <Label>{t.soundSystem}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.projector}
                          onCheckedChange={(checked) => handleFeatureChange('projector', checked)}
                        />
                        <Label>{t.projector}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.whiteboard}
                          onCheckedChange={(checked) => handleFeatureChange('whiteboard', checked)}
                        />
                        <Label>{t.whiteboard}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <Label className="text-lg font-medium">{t.facilities}</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.kitchen}
                          onCheckedChange={(checked) => handleFeatureChange('kitchen', checked)}
                        />
                        <Label>{t.kitchen}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.bathroom}
                          onCheckedChange={(checked) => handleFeatureChange('bathroom', checked)}
                        />
                        <Label>{t.bathroom}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.changingRoom}
                          onCheckedChange={(checked) => handleFeatureChange('changingRoom', checked)}
                        />
                        <Label>{t.changingRoom}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.shower}
                          onCheckedChange={(checked) => handleFeatureChange('shower', checked)}
                        />
                        <Label>{t.shower}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <Label className="text-lg font-medium">{t.equipment}</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.towels}
                          onCheckedChange={(checked) => handleFeatureChange('towels', checked)}
                        />
                        <Label>{t.towels}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.equipment}
                          onCheckedChange={(checked) => handleFeatureChange('equipment', checked)}
                        />
                        <Label>{t.equipment}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Climate Control */}
                  <div>
                    <Label className="text-lg font-medium">Climate Control</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.airConditioning}
                          onCheckedChange={(checked) => handleFeatureChange('airConditioning', checked)}
                        />
                        <Label>{t.airConditioning}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.features.heating}
                          onCheckedChange={(checked) => handleFeatureChange('heating', checked)}
                        />
                        <Label>{t.heating}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <Label className="text-lg font-medium">{t.images}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t.dragDropImages}</p>
                  <Button type="button" variant="outline" className="mt-4">
                    {t.uploadImages}
                  </Button>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <ImageWithFallback
                          src={image}
                          alt={`Venue image ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            handleInputChange('images', newImages);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={loading || !validateForm()}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
