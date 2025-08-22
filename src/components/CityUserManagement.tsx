import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Star,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  X,
  Check,
  AlertTriangle
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
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'city_owner' | 'venue_manager' | 'staff' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  city: string;
  venues: string[];
  lastActive: string;
  createdAt: string;
  permissions: {
    manageVenues: boolean;
    manageBookings: boolean;
    manageUsers: boolean;
    viewAnalytics: boolean;
    managePayments: boolean;
    sendNotifications: boolean;
  };
  activity: {
    totalBookings: number;
    totalSpent: number;
    lastBooking: string;
    rating: number;
  };
}

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
}

interface CityUserManagementProps {
  cityName: string;
  language: string;
}

export default function CityUserManagement({ cityName, language }: CityUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'permissions' | 'activity'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const translations = {
    fi: {
      userManagement: 'Käyttäjien hallinta',
      overview: 'Yleiskatsaus',
      users: 'Käyttäjät',
      roles: 'Roolit',
      permissions: 'Oikeudet',
      activity: 'Aktiviteetti',
      totalUsers: 'Käyttäjät yhteensä',
      activeUsers: 'Aktiiviset käyttäjät',
      venueManagers: 'Tilanhoitajat',
      staffMembers: 'Henkilökunta',
      searchUsers: 'Etsi käyttäjiä...',
      allRoles: 'Kaikki roolit',
      allStatuses: 'Kaikki tilat',
      cityOwner: 'Kaupungin omistaja',
      venueManager: 'Tilanhoitaja',
      staff: 'Henkilökunta',
      user: 'Käyttäjä',
      active: 'Aktiivinen',
      inactive: 'Ei aktiivinen',
      suspended: 'Keskeytetty',
      inviteUser: 'Kutsu käyttäjä',
      editUser: 'Muokkaa käyttäjää',
      deleteUser: 'Poista käyttäjä',
      suspendUser: 'Keskeytä käyttäjä',
      activateUser: 'Aktivoi käyttäjä',
      fullName: 'Koko nimi',
      email: 'Sähköposti',
      phone: 'Puhelin',
      role: 'Rooli',
      status: 'Tila',
      assignedVenues: 'Määritellyt tilat',
      permissions: 'Oikeudet',
      manageVenues: 'Hallitse tiloja',
      manageBookings: 'Hallitse varauksia',
      manageUsers: 'Hallitse käyttäjiä',
      viewAnalytics: 'Näytä analytiikka',
      managePayments: 'Hallitse maksuja',
      sendNotifications: 'Lähetä ilmoitukset',
      save: 'Tallenna',
      cancel: 'Peruuta',
      invite: 'Kutsu',
      confirmDelete: 'Oletko varma, että haluat poistaa tämän käyttäjän?',
      userUpdated: 'Käyttäjä päivitetty onnistuneesti',
      userInvited: 'Käyttäjä kutsuttu onnistuneesti',
      userDeleted: 'Käyttäjä poistettu onnistuneesti',
      userSuspended: 'Käyttäjä keskeytetty onnistuneesti',
      userActivated: 'Käyttäjä aktivoitu onnistuneesti',
      errorUpdating: 'Virhe päivitettäessä käyttäjää',
      noUsers: 'Ei käyttäjiä',
      lastActive: 'Viimeksi aktiivinen',
      createdAt: 'Luotu',
      totalBookings: 'Varaukset yhteensä',
      totalSpent: 'Kokonaismenot',
      lastBooking: 'Viimeisin varaus',
      rating: 'Arvosana',
      userActivity: 'Käyttäjän aktiviteetti',
      recentActivity: 'Viimeaikainen aktiviteetti',
      roleManagement: 'Roolien hallinta',
      permissionManagement: 'Oikeuksien hallinta',
      venueAccess: 'Tilojen kättöoikeus',
      accessControl: 'Kättöoikeuksien hallinta',
      bulkActions: 'Joukko-operaatiot',
      selectAll: 'Valitse kaikki',
      exportUsers: 'Vie käyttäjät',
      importUsers: 'Tuo käyttäjät',
      userGroups: 'Käyttäjäryhmät',
      createGroup: 'Luo ryhmä',
      groupName: 'Ryhmän nimi',
      groupDescription: 'Ryhmän kuvaus',
      addToGroup: 'Lisää ryhmään',
      removeFromGroup: 'Poista ryhmästä'
    },
    en: {
      userManagement: 'User Management',
      overview: 'Overview',
      users: 'Users',
      roles: 'Roles',
      permissions: 'Permissions',
      activity: 'Activity',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      venueManagers: 'Venue Managers',
      staffMembers: 'Staff Members',
      searchUsers: 'Search users...',
      allRoles: 'All roles',
      allStatuses: 'All statuses',
      cityOwner: 'City Owner',
      venueManager: 'Venue Manager',
      staff: 'Staff',
      user: 'User',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      inviteUser: 'Invite User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      suspendUser: 'Suspend User',
      activateUser: 'Activate User',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      status: 'Status',
      assignedVenues: 'Assigned Venues',
      permissions: 'Permissions',
      manageVenues: 'Manage Venues',
      manageBookings: 'Manage Bookings',
      manageUsers: 'Manage Users',
      viewAnalytics: 'View Analytics',
      managePayments: 'Manage Payments',
      sendNotifications: 'Send Notifications',
      save: 'Save',
      cancel: 'Cancel',
      invite: 'Invite',
      confirmDelete: 'Are you sure you want to delete this user?',
      userUpdated: 'User updated successfully',
      userInvited: 'User invited successfully',
      userDeleted: 'User deleted successfully',
      userSuspended: 'User suspended successfully',
      userActivated: 'User activated successfully',
      errorUpdating: 'Error updating user',
      noUsers: 'No users found',
      lastActive: 'Last Active',
      createdAt: 'Created',
      totalBookings: 'Total Bookings',
      totalSpent: 'Total Spent',
      lastBooking: 'Last Booking',
      rating: 'Rating',
      userActivity: 'User Activity',
      recentActivity: 'Recent Activity',
      roleManagement: 'Role Management',
      permissionManagement: 'Permission Management',
      venueAccess: 'Venue Access',
      accessControl: 'Access Control',
      bulkActions: 'Bulk Actions',
      selectAll: 'Select All',
      exportUsers: 'Export Users',
      importUsers: 'Import Users',
      userGroups: 'User Groups',
      createGroup: 'Create Group',
      groupName: 'Group Name',
      groupDescription: 'Group Description',
      addToGroup: 'Add to Group',
      removeFromGroup: 'Remove from Group'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Mock data for demonstration
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockUsers: User[] = [
      {
        id: '1',
        fullName: 'Matti Virtanen',
        email: 'matti.virtanen@helsinki.fi',
        phone: '+358 40 123 4567',
        role: 'venue_manager',
        status: 'active',
        city: cityName,
        venues: ['Keskuspuiston Sauna', 'Kaupungintalon Kokoushuone'],
        lastActive: '2024-02-15T10:30:00Z',
        createdAt: '2023-06-15T09:00:00Z',
        permissions: {
          manageVenues: true,
          manageBookings: true,
          manageUsers: false,
          viewAnalytics: true,
          managePayments: false,
          sendNotifications: true
        },
        activity: {
          totalBookings: 156,
          totalSpent: 3890,
          lastBooking: '2024-02-14T16:00:00Z',
          rating: 4.8
        }
      },
      {
        id: '2',
        fullName: 'Anna Korhonen',
        email: 'anna.korhonen@helsinki.fi',
        phone: '+358 40 234 5678',
        role: 'staff',
        status: 'active',
        city: cityName,
        venues: ['Urheilupuiston Tenniskenttä'],
        lastActive: '2024-02-15T14:15:00Z',
        createdAt: '2023-08-20T11:00:00Z',
        permissions: {
          manageVenues: false,
          manageBookings: true,
          manageUsers: false,
          viewAnalytics: false,
          managePayments: false,
          sendNotifications: false
        },
        activity: {
          totalBookings: 89,
          totalSpent: 2230,
          lastBooking: '2024-02-13T18:00:00Z',
          rating: 4.6
        }
      },
      {
        id: '3',
        fullName: 'Jukka Laaksonen',
        email: 'jukka.laaksonen@helsinki.fi',
        phone: '+358 40 345 6789',
        role: 'user',
        status: 'active',
        city: cityName,
        venues: [],
        lastActive: '2024-02-15T09:45:00Z',
        createdAt: '2023-12-01T10:00:00Z',
        permissions: {
          manageVenues: false,
          manageBookings: false,
          manageUsers: false,
          viewAnalytics: false,
          managePayments: false,
          sendNotifications: false
        },
        activity: {
          totalBookings: 23,
          totalSpent: 575,
          lastBooking: '2024-02-12T15:00:00Z',
          rating: 4.9
        }
      }
    ];

    const mockVenues: Venue[] = [
      { id: '1', name: 'Keskuspuiston Sauna', type: 'Sauna', city: cityName },
      { id: '2', name: 'Kaupungintalon Kokoushuone', type: 'Meeting Room', city: cityName },
      { id: '3', name: 'Urheilupuiston Tenniskenttä', type: 'Tennis Court', city: cityName },
      { id: '4', name: 'Luovan Talon Studio', type: 'Creative Space', city: cityName }
    ];

    setUsers(mockUsers);
    setVenues(mockVenues);
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      city_owner: "bg-purple-100 text-purple-800",
      venue_manager: "bg-blue-100 text-blue-800",
      staff: "bg-green-100 text-green-800",
      user: "bg-gray-100 text-gray-800"
    };
    
    const roleLabels = {
      city_owner: t.cityOwner,
      venue_manager: t.venueManager,
      staff: t.staff,
      user: t.user
    };

    return (
      <Badge className={roleColors[role as keyof typeof roleColors]}>
        {roleLabels[role as keyof typeof roleLabels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800"
    };
    
    const statusLabels = {
      active: t.active,
      inactive: t.inactive,
      suspended: t.suspended
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateUser = async (userData: Partial<User>) => {
    try {
      setUsers(users.map(user => 
        user.id === userData.id ? { ...user, ...userData } : user
      ));
      setActionMessage({ type: 'success', message: t.userUpdated });
      setShowUserDialog(false);
    } catch (error) {
      setActionMessage({ type: 'error', message: t.errorUpdating });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setUsers(users.filter(user => user.id !== userId));
      setActionMessage({ type: 'success', message: t.userDeleted });
    } catch (error) {
      setActionMessage({ type: 'error', message: t.errorUpdating });
    }
  };

  const handleSuspendUser = async (userId: string, suspended: boolean) => {
    try {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: suspended ? 'suspended' : 'active' } : user
      ));
      setActionMessage({ 
        type: 'success', 
        message: suspended ? t.userSuspended : t.userActivated 
      });
    } catch (error) {
      setActionMessage({ type: 'error', message: t.errorUpdating });
    }
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

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    venueManagers: users.filter(u => u.role === 'venue_manager').length,
    staff: users.filter(u => u.role === 'staff').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.userManagement}</h2>
          <p className="text-gray-600">{cityName} - {t.userManagement.toLowerCase()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportUsers}
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t.inviteUser}
          </Button>
        </div>
      </div>

      {/* Action Message Display */}
      {actionMessage && (
        <Alert className={actionMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={actionMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {actionMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="users">{t.users}</TabsTrigger>
          <TabsTrigger value="roles">{t.roles}</TabsTrigger>
          <TabsTrigger value="permissions">{t.permissions}</TabsTrigger>
          <TabsTrigger value="activity">{t.activity}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.active} {t.active.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.activeUsers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {((userStats.active / userStats.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.venueManagers}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.venueManagers}</div>
                <p className="text-xs text-muted-foreground">
                  Managing {venues.length} venues
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.staffMembers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.staff}</div>
                <p className="text-xs text-muted-foreground">
                  Supporting operations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentActivity}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t.searchUsers}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allRoles}</SelectItem>
                <SelectItem value="city_owner">{t.cityOwner}</SelectItem>
                <SelectItem value="venue_manager">{t.venueManager}</SelectItem>
                <SelectItem value="staff">{t.staff}</SelectItem>
                <SelectItem value="user">{t.user}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="inactive">{t.inactive}</SelectItem>
                <SelectItem value="suspended">{t.suspended}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.users}</CardTitle>
              <CardDescription>
                {filteredUsers.length} {t.users.toLowerCase()} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.fullName}</TableHead>
                      <TableHead>{t.email}</TableHead>
                      <TableHead>{t.role}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead>{t.assignedVenues}</TableHead>
                      <TableHead>{t.lastActive}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.venues.map((venue, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {venue}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendUser(user.id, user.status !== 'suspended')}
                            >
                              {user.status === 'suspended' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t.noUsers}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.roleManagement}</CardTitle>
              <CardDescription>
                Manage user roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { role: 'city_owner', label: t.cityOwner, description: 'Full access to all city operations' },
                  { role: 'venue_manager', label: t.venueManager, description: 'Manage assigned venues and bookings' },
                  { role: 'staff', label: t.staff, description: 'Support venue operations and customer service' },
                  { role: 'user', label: t.user, description: 'Standard user with booking capabilities' }
                ].map((roleInfo) => (
                  <div key={roleInfo.role} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{roleInfo.label}</h4>
                        <p className="text-sm text-gray-600">{roleInfo.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {users.filter(u => u.role === roleInfo.role).length} users
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.permissionManagement}</CardTitle>
              <CardDescription>
                Configure access permissions for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { key: 'manageVenues', label: t.manageVenues, description: 'Create, edit, and delete venues' },
                  { key: 'manageBookings', label: t.manageBookings, description: 'Approve, reject, and manage bookings' },
                  { key: 'manageUsers', label: t.manageUsers, description: 'Invite and manage other users' },
                  { key: 'viewAnalytics', label: t.viewAnalytics, description: 'Access to revenue and usage reports' },
                  { key: 'managePayments', label: t.managePayments, description: 'Process payments and refunds' },
                  { key: 'sendNotifications', label: t.sendNotifications, description: 'Send system notifications' }
                ].map((permission) => (
                  <div key={permission.key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{permission.label}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {['city_owner', 'venue_manager', 'staff', 'user'].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Label className="text-xs">{role}</Label>
                            <Switch
                              checked={users.some(u => u.role === role && u.permissions[permission.key as keyof typeof u.permissions])}
                              disabled
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.userActivity}</CardTitle>
              <CardDescription>
                Monitor user activity and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.fullName}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">{t.totalBookings}</p>
                            <p className="font-medium">{user.activity.totalBookings}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{t.totalSpent}</p>
                            <p className="font-medium">€{user.activity.totalSpent}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{t.lastBooking}</p>
                            <p className="font-medium">
                              {new Date(user.activity.lastBooking).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">{t.rating}</p>
                            <p className="font-medium">⭐ {user.activity.rating}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editUser}</DialogTitle>
            <DialogDescription>
              {selectedUser?.fullName} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.fullName}</Label>
                  <Input value={selectedUser.fullName} readOnly />
                </div>
                <div>
                  <Label>{t.email}</Label>
                  <Input value={selectedUser.email} readOnly />
                </div>
                <div>
                  <Label>{t.role}</Label>
                  <Select value={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="city_owner">{t.cityOwner}</SelectItem>
                      <SelectItem value="venue_manager">{t.venueManager}</SelectItem>
                      <SelectItem value="staff">{t.staff}</SelectItem>
                      <SelectItem value="user">{t.user}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.status}</Label>
                  <Select value={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t.active}</SelectItem>
                      <SelectItem value="inactive">{t.inactive}</SelectItem>
                      <SelectItem value="suspended">{t.suspended}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>{t.permissions}</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Object.entries(selectedUser.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => {
                          const updatedUser = {
                            ...selectedUser,
                            permissions: {
                              ...selectedUser.permissions,
                              [key]: checked
                            }
                          };
                          setSelectedUser(updatedUser);
                        }}
                      />
                      <Label className="text-sm">
                        {translations[language as keyof typeof translations][key as keyof typeof translations[typeof language]]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={() => handleUpdateUser(selectedUser)}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.inviteUser}</DialogTitle>
            <DialogDescription>
              Invite a new user to manage venues in {cityName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.fullName}</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div>
              <Label>{t.email}</Label>
              <Input type="email" placeholder="user@example.com" />
            </div>
            <div>
              <Label>{t.role}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue_manager">{t.venueManager}</SelectItem>
                  <SelectItem value="staff">{t.staff}</SelectItem>
                  <SelectItem value="user">{t.user}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                {t.cancel}
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                {t.invite}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
