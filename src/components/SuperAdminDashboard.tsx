import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Building, Calendar, Activity, Shield, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { getAllUsers, updateUserRole, updateUserStatus, getAllBookings, getUserActivityLogs, User, UserRole, Booking, UserActivityLog } from '../lib/database';

interface SuperAdminDashboardProps {
  onBack: () => void;
  language: string;
}

export default function SuperAdminDashboard({ onBack, language }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'activity'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  const translations = {
    fi: {
      title: 'Super Admin Hallinta',
      overview: 'Yleiskatsaus',
      users: 'Käyttäjät',
      bookings: 'Varaukset',
      activity: 'Aktiviteetti',
      back: 'Takaisin',
      totalUsers: 'Käyttäjät yhteensä',
      totalBookings: 'Varaukset yhteensä',
      activeVenues: 'Aktiiviset tilat',
      recentActivity: 'Viimeaikainen aktiviteetti',
      searchUsers: 'Etsi käyttäjiä...',
      allRoles: 'Kaikki roolit',
      user: 'Käyttäjä',
      cityOwner: 'Kaupungin omistaja',
      superAdmin: 'Super Admin',
      active: 'Aktiivinen',
      inactive: 'Ei aktiivinen',
      editUser: 'Muokkaa käyttäjää',
      changeRole: 'Muuta roolia',
      changeStatus: 'Muuta tilaa',
      save: 'Tallenna',
      cancel: 'Peruuta',
      delete: 'Poista',
      confirmDelete: 'Oletko varma, että haluat poistaa tämän käyttäjän?',
      userUpdated: 'Käyttäjä päivitetty onnistuneesti',
      errorUpdating: 'Virhe päivitettäessä käyttäjää',
      noUsers: 'Ei käyttäjiä',
      noBookings: 'Ei varauksia',
      noActivity: 'Ei aktiviteettia'
    },
    en: {
      title: 'Super Admin Dashboard',
      overview: 'Overview',
      users: 'Users',
      bookings: 'Bookings',
      activity: 'Activity',
      back: 'Back',
      totalUsers: 'Total Users',
      totalBookings: 'Total Bookings',
      activeVenues: 'Active Venues',
      recentActivity: 'Recent Activity',
      searchUsers: 'Search users...',
      allRoles: 'All roles',
      user: 'User',
      cityOwner: 'City Owner',
      superAdmin: 'Super Admin',
      active: 'Active',
      inactive: 'Inactive',
      editUser: 'Edit User',
      changeRole: 'Change Role',
      changeStatus: 'Change Status',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this user?',
      userUpdated: 'User updated successfully',
      errorUpdating: 'Error updating user',
      noUsers: 'No users found',
      noBookings: 'No bookings found',
      noActivity: 'No activity found'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, bookingsData, activityData] = await Promise.all([
        getAllUsers(),
        getAllBookings(),
        getUserActivityLogs()
      ]);
      setUsers(usersData);
      setBookings(bookingsData);
      setActivityLogs(activityData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const success = await updateUserRole(userId, newRole);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setShowUserDialog(false);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const success = await updateUserStatus(userId, isActive);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_active: isActive } : user
        ));
        setShowUserDialog(false);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'city_owner': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return t.superAdmin;
      case 'city_owner': return t.cityOwner;
      case 'user': return t.user;
      default: return t.user;
    }
  };

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
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-sm text-gray-600">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: t.overview, icon: Activity },
              { id: 'users', label: t.users, icon: Users },
              { id: 'bookings', label: t.bookings, icon: Calendar },
              { id: 'activity', label: t.activity, icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {users.filter(u => u.is_active).length} {t.active.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalBookings}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {bookings.filter(b => b.status === 'confirmed').length} confirmed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activeVenues}</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-muted-foreground">
                    Across {new Set(bookings.map(b => b.venue_id)).size} cities
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t.recentActivity}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
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
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allRoles}</SelectItem>
                  <SelectItem value="user">{t.user}</SelectItem>
                  <SelectItem value="city_owner">{t.cityOwner}</SelectItem>
                  <SelectItem value="super_admin">{t.superAdmin}</SelectItem>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? t.active : t.inactive}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
          </div>
        )}

        {activeTab === 'bookings' && (
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
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.venues?.name || 'Unknown Venue'}
                        </TableCell>
                        <TableCell>{booking.user_id}</TableCell>
                        <TableCell>
                          {new Date(booking.start_time).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>€{booking.total_price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t.noBookings}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle>{t.activity}</CardTitle>
              <CardDescription>
                {activityLogs.length} activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-500">
                          User: {log.user_id} • {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.details && (
                          <p className="text-xs text-gray-400 mt-1">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t.noActivity}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editUser}</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.changeRole}</label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t.user}</SelectItem>
                    <SelectItem value="city_owner">{t.cityOwner}</SelectItem>
                    <SelectItem value="super_admin">{t.superAdmin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.changeStatus}</label>
                <Select
                  value={selectedUser.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => handleUpdateUserStatus(selectedUser.id, value === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
