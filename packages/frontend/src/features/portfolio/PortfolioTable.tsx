import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { usePortfolioStore } from './store';

export function PortfolioTable() {
  const { performance, lastUpdated, isLoading, error, fetchPerformance } = usePortfolioStore();

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Loading portfolio data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Error loading portfolio data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>No portfolio data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const performanceData = [
    {
      period: '1 Day',
      value: performance.dayChange.value,
      percentage: performance.dayChange.percentage,
    },
    {
      period: '1 Week',
      value: performance.weekChange.value,
      percentage: performance.weekChange.percentage,
    },
    {
      period: '1 Month',
      value: performance.monthChange.value,
      percentage: performance.monthChange.percentage,
    },
    {
      period: '3 Months',
      value: performance.threeMonthChange.value,
      percentage: performance.threeMonthChange.percentage,
    },
    {
      period: '1 Year',
      value: performance.yearChange.value,
      percentage: performance.yearChange.percentage,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <CardDescription>
          Current Value: <span className="font-semibold text-foreground">{formatCurrency(performance.currentValue)}</span>
          {lastUpdated && (
            <span className="text-xs ml-2">
              (Last updated: {new Date(lastUpdated).toLocaleString()})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Change ($)</TableHead>
              <TableHead className="text-right">Change (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.map((data) => (
              <TableRow key={data.period}>
                <TableCell className="font-medium">{data.period}</TableCell>
                <TableCell className={`text-right ${getChangeColor(data.value)}`}>
                  {formatCurrency(data.value)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${getChangeColor(data.percentage)}`}>
                  {formatPercentage(data.percentage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
