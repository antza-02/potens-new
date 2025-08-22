import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Receipt,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';

interface FinancialData {
  revenue: {
    total: number;
    monthly: number[];
    growth: number;
    trend: 'up' | 'down';
    byVenue: Array<{ name: string; amount: number; percentage: number }>;
  };
  payments: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    methods: Array<{ method: string; amount: number; percentage: number }>;
  };
  transactions: Array<{
    id: string;
    venue: string;
    user: string;
    amount: number;
    method: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    date: string;
    bookingId: string;
  }>;
  expenses: {
    total: number;
    categories: Array<{ category: string; amount: number; percentage: number }>;
  };
  refunds: {
    total: number;
    count: number;
    pending: number;
    processed: number;
  };
}

interface CityFinancialManagementProps {
  cityName: string;
  language: string;
  data?: FinancialData;
}

export default function CityFinancialManagement({ 
  cityName, 
  language, 
  data 
}: CityFinancialManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'payments' | 'transactions' | 'expenses' | 'refunds'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [venueFilter, setVenueFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const translations = {
    fi: {
      financialManagement: 'Talouden hallinta',
      overview: 'Yleiskatsaus',
      revenue: 'Tulot',
      payments: 'Maksut',
      transactions: 'Tapahtumat',
      expenses: 'Kulut',
      refunds: 'Palautukset',
      timeRange: 'Aikaväli',
      week: 'Viikko',
      month: 'Kuukausi',
      quarter: 'Neljännesvuosi',
      year: 'Vuosi',
      totalRevenue: 'Kokonaistulot',
      monthlyGrowth: 'Kuukausikasvu',
      totalPayments: 'Maksut yhteensä',
      pendingPayments: 'Odottaa maksua',
      completedPayments: 'Valmiit maksut',
      failedPayments: 'Epäonnistuneet maksut',
      totalExpenses: 'Kulut yhteensä',
      totalRefunds: 'Palautukset yhteensä',
      revenueByVenue: 'Tulot tilan mukaan',
      paymentMethods: 'Maksutavat',
      recentTransactions: 'Viimeisimmät tapahtumat',
      transactionHistory: 'Tapahtumahistoria',
      venue: 'Tila',
      user: 'Käyttäjä',
      amount: 'Summa',
      method: 'Maksutapa',
      status: 'Tila',
      date: 'Päivä',
      bookingId: 'Varaus ID',
      completed: 'Valmis',
      pending: 'Odottaa',
      failed: 'Epäonnistui',
      refunded: 'Palautettu',
      creditCard: 'Luottokortti',
      bankTransfer: 'Pankkisiirto',
      cash: 'Käteinen',
      mobilePayment: 'Mobiilimaksu',
      exportData: 'Vie data',
      refresh: 'Päivitä',
      searchTransactions: 'Etsi tapahtumia...',
      allVenues: 'Kaikki tilat',
      allStatuses: 'Kaikki tilat',
      revenueTrends: 'Tulotrendit',
      paymentAnalytics: 'Maksuanalyysi',
      expenseBreakdown: 'Kulujen jakauma',
      refundManagement: 'Palautusten hallinta',
      processingFee: 'Käsittelymaksu',
      taxAmount: 'Veron määrä',
      netAmount: 'Nettosumma',
      grossAmount: 'Bruttosumma',
      currency: 'EUR',
      noData: 'Ei dataa saatavilla',
      loading: 'Ladataan...',
      chartComingSoon: 'Kaavio tulossa',
      dataExport: 'Datan vienti',
      csvExport: 'Vie CSV',
      pdfExport: 'Vie PDF',
      excelExport: 'Vie Excel',
      financialReport: 'Talousraportti',
      generateReport: 'Luo raportti',
      downloadReport: 'Lataa raportti',
      reportPeriod: 'Raporttijakso',
      customPeriod: 'Mukautettu jakso',
      startDate: 'Aloituspäivä',
      endDate: 'Lopetuspäivä'
    },
    en: {
      financialManagement: 'Financial Management',
      overview: 'Overview',
      revenue: 'Revenue',
      payments: 'Payments',
      transactions: 'Transactions',
      expenses: 'Expenses',
      refunds: 'Refunds',
      timeRange: 'Time Range',
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
      year: 'Year',
      totalRevenue: 'Total Revenue',
      monthlyGrowth: 'Monthly Growth',
      totalPayments: 'Total Payments',
      pendingPayments: 'Pending Payments',
      completedPayments: 'Completed Payments',
      failedPayments: 'Failed Payments',
      totalExpenses: 'Total Expenses',
      totalRefunds: 'Total Refunds',
      revenueByVenue: 'Revenue by Venue',
      paymentMethods: 'Payment Methods',
      recentTransactions: 'Recent Transactions',
      transactionHistory: 'Transaction History',
      venue: 'Venue',
      user: 'User',
      amount: 'Amount',
      method: 'Method',
      status: 'Status',
      date: 'Date',
      bookingId: 'Booking ID',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      refunded: 'Refunded',
      creditCard: 'Credit Card',
      bankTransfer: 'Bank Transfer',
      cash: 'Cash',
      mobilePayment: 'Mobile Payment',
      exportData: 'Export Data',
      refresh: 'Refresh',
      searchTransactions: 'Search transactions...',
      allVenues: 'All venues',
      allStatuses: 'All statuses',
      revenueTrends: 'Revenue Trends',
      paymentAnalytics: 'Payment Analytics',
      expenseBreakdown: 'Expense Breakdown',
      refundManagement: 'Refund Management',
      processingFee: 'Processing Fee',
      taxAmount: 'Tax Amount',
      netAmount: 'Net Amount',
      grossAmount: 'Gross Amount',
      currency: 'EUR',
      noData: 'No data available',
      loading: 'Loading...',
      chartComingSoon: 'Chart coming soon',
      dataExport: 'Data Export',
      csvExport: 'Export CSV',
      pdfExport: 'Export PDF',
      excelExport: 'Export Excel',
      financialReport: 'Financial Report',
      generateReport: 'Generate Report',
      downloadReport: 'Download Report',
      reportPeriod: 'Report Period',
      customPeriod: 'Custom Period',
      startDate: 'Start Date',
      endDate: 'End Date'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Mock data for demonstration
  const mockData: FinancialData = {
    revenue: {
      total: 45680,
      monthly: [32000, 35000, 38000, 42000, 45680],
      growth: 12.5,
      trend: 'up',
      byVenue: [
        { name: 'Keskuspuiston Sauna', amount: 12500, percentage: 27.4 },
        { name: 'Kaupungintalon Kokoushuone', amount: 9800, percentage: 21.5 },
        { name: 'Urheilupuiston Tenniskenttä', amount: 7200, percentage: 15.8 },
        { name: 'Luovan Talon Studio', amount: 6800, percentage: 14.9 },
        { name: 'Other Venues', amount: 9380, percentage: 20.4 }
      ]
    },
    payments: {
      total: 45680,
      pending: 2340,
      completed: 42340,
      failed: 1000,
      methods: [
        { method: 'Credit Card', amount: 32000, percentage: 70.1 },
        { method: 'Bank Transfer', amount: 8000, percentage: 17.5 },
        { method: 'Mobile Payment', amount: 4000, percentage: 8.8 },
        { method: 'Cash', amount: 1680, percentage: 3.6 }
      ]
    },
    transactions: [
      {
        id: 'TXN001',
        venue: 'Keskuspuiston Sauna',
        user: 'Matti Virtanen',
        amount: 75,
        method: 'Credit Card',
        status: 'completed',
        date: '2024-02-15T14:30:00Z',
        bookingId: 'BK001'
      },
      {
        id: 'TXN002',
        venue: 'Kaupungintalon Kokoushuone',
        user: 'Anna Korhonen',
        amount: 180,
        method: 'Bank Transfer',
        status: 'pending',
        date: '2024-02-15T10:15:00Z',
        bookingId: 'BK002'
      },
      {
        id: 'TXN003',
        venue: 'Urheilupuiston Tenniskenttä',
        user: 'Jukka Laaksonen',
        amount: 70,
        method: 'Mobile Payment',
        status: 'completed',
        date: '2024-02-15T09:45:00Z',
        bookingId: 'BK003'
      },
      {
        id: 'TXN004',
        venue: 'Luovan Talon Studio',
        user: 'Maria Mäkinen',
        amount: 90,
        method: 'Credit Card',
        status: 'failed',
        date: '2024-02-15T08:20:00Z',
        bookingId: 'BK004'
      }
    ],
    expenses: {
      total: 12340,
      categories: [
        { category: 'Maintenance', amount: 4500, percentage: 36.5 },
        { category: 'Utilities', amount: 3200, percentage: 25.9 },
        { category: 'Staff', amount: 2800, percentage: 22.7 },
        { category: 'Marketing', amount: 1200, percentage: 9.7 },
        { category: 'Other', amount: 640, percentage: 5.2 }
      ]
    },
    refunds: {
      total: 2340,
      count: 15,
      pending: 8,
      processed: 7
    }
  };

  const currentData = data || mockData;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-blue-100 text-blue-800"
    };
    
    const statusLabels = {
      completed: t.completed,
      pending: t.pending,
      failed: t.failed,
      refunded: t.refunded
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const getMethodLabel = (method: string) => {
    const methodLabels = {
      'Credit Card': t.creditCard,
      'Bank Transfer': t.bankTransfer,
      'Cash': t.cash,
      'Mobile Payment': t.mobilePayment
    };
    return methodLabels[method as keyof typeof methodLabels] || method;
  };

  const filteredTransactions = currentData.transactions.filter(transaction => {
    const matchesVenue = venueFilter === 'all' || transaction.venue === venueFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesVenue && matchesStatus;
  });

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting financial data in ${format} format`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.financialManagement}</h2>
          <p className="text-gray-600">{cityName} - {t.financialManagement.toLowerCase()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t.week}</SelectItem>
              <SelectItem value="month">{t.month}</SelectItem>
              <SelectItem value="quarter">{t.quarter}</SelectItem>
              <SelectItem value="year">{t.year}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportData}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="revenue">{t.revenue}</TabsTrigger>
          <TabsTrigger value="payments">{t.payments}</TabsTrigger>
          <TabsTrigger value="transactions">{t.transactions}</TabsTrigger>
          <TabsTrigger value="expenses">{t.expenses}</TabsTrigger>
          <TabsTrigger value="refunds">{t.refunds}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{currentData.revenue.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{currentData.revenue.growth}% {t.monthlyGrowth.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalPayments}</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{currentData.payments.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {currentData.payments.completed} {t.completed.toLowerCase()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalExpenses}</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{currentData.expenses.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Net: €{(currentData.revenue.total - currentData.expenses.total).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalRefunds}</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{currentData.refunds.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {currentData.refunds.count} {t.refunds.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Venue and Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.revenueByVenue}</CardTitle>
                <CardDescription>
                  Revenue distribution across venues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.revenue.byVenue.map((venue, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{venue.name}</p>
                        <p className="text-xs text-gray-500">{venue.percentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">€{venue.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.paymentMethods}</CardTitle>
                <CardDescription>
                  Payment method distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.payments.methods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getMethodLabel(method.method)}</p>
                        <p className="text-xs text-gray-500">{method.percentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">€{method.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentTransactions}</CardTitle>
              <CardDescription>
                Latest financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.venue}</p>
                        <p className="text-sm text-gray-500">{transaction.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{transaction.amount}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(transaction.status)}
                        <span className="text-xs text-gray-500">{getMethodLabel(transaction.method)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.revenueTrends}</CardTitle>
              <CardDescription>
                Revenue performance over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{t.chartComingSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.totalPayments}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600">€{currentData.payments.total.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Total processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.completedPayments}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">€{currentData.payments.completed.toLocaleString()}</div>
                <p className="text-sm text-gray-500">
                  {((currentData.payments.completed / currentData.payments.total) * 100).toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.pendingPayments}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600">€{currentData.payments.pending.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.failedPayments}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-red-600">€{currentData.payments.failed.toLocaleString()}</div>
                <p className="text-sm text-gray-500">
                  {((currentData.payments.failed / currentData.payments.total) * 100).toFixed(1)}% failure rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.paymentAnalytics}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{t.chartComingSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t.searchTransactions}
                className="max-w-sm"
              />
            </div>
            <Select value={venueFilter} onValueChange={setVenueFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allVenues}</SelectItem>
                <SelectItem value="Keskuspuiston Sauna">Keskuspuiston Sauna</SelectItem>
                <SelectItem value="Kaupungintalon Kokoushuone">Kaupungintalon Kokoushuone</SelectItem>
                <SelectItem value="Urheilupuiston Tenniskenttä">Urheilupuiston Tenniskenttä</SelectItem>
                <SelectItem value="Luovan Talon Studio">Luovan Talon Studio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="completed">{t.completed}</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="failed">{t.failed}</SelectItem>
                <SelectItem value="refunded">{t.refunded}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.transactionHistory}</CardTitle>
              <CardDescription>
                {filteredTransactions.length} {t.transactions.toLowerCase()} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.venue}</TableHead>
                      <TableHead>{t.user}</TableHead>
                      <TableHead>{t.amount}</TableHead>
                      <TableHead>{t.method}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.bookingId}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.venue}</TableCell>
                        <TableCell>{transaction.user}</TableCell>
                        <TableCell>€{transaction.amount}</TableCell>
                        <TableCell>{getMethodLabel(transaction.method)}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.bookingId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t.noData}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.expenseBreakdown}</CardTitle>
              <CardDescription>
                Expense categorization and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.expenses.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{category.category}</h4>
                        <p className="text-sm text-gray-500">{category.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">€{category.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t.totalRefunds}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600">€{currentData.refunds.total.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Total refunded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Count</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-gray-600">{currentData.refunds.count}</div>
                <p className="text-sm text-gray-500">Refund requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Pending</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{currentData.refunds.pending}</div>
                <p className="text-sm text-gray-500">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Processed</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">{currentData.refunds.processed}</div>
                <p className="text-sm text-gray-500">Completed refunds</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.refundManagement}</CardTitle>
              <CardDescription>
                Manage and process refund requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Refund management interface coming soon</p>
                <p className="text-sm text-gray-400">Process refunds, track status, and manage customer requests</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
