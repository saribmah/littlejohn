import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { usePortfolioStore } from '../portfolio/store';

type TimePeriod = '1D' | '7D' | '30D' | 'All-time';

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('All-time');
  const { performance, positions, isLoading, isLoadingPositions, fetchPerformance, fetchPositions } = usePortfolioStore();

  useEffect(() => {
    fetchPerformance();
    fetchPositions();
  }, [fetchPerformance, fetchPositions]);

  // Current value always shows day change
  const dayChange = performance?.dayChange || { value: 0, percentage: 0 };
  const isDayPositive = dayChange.value >= 0;

  // Return card shows the selected period's performance
  const getReturnData = () => {
    if (!performance) return { value: 0, percentage: 0 };

    switch (selectedPeriod) {
      case '1D':
        return performance.dayChange;
      case '7D':
        return performance.weekChange;
      case '30D':
        return performance.monthChange;
      case 'All-time':
        return performance.yearChange;
      default:
        return performance.dayChange;
    }
  };

  const returnData = getReturnData();
  const isReturnPositive = returnData.percentage >= 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Calculate S&P comparison (mock for now - would need real S&P data)
  const spComparison = '+2.1%';

  return (
    <div className="space-y-6">
      {/* Time Period Filters */}
      <div className="flex gap-3">
        {(['1D', '7D', '30D', 'All-time'] as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-white text-black'
                : 'bg-transparent text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-2xl font-bold mb-4">Performance</h2>
          <div className="h-96 flex items-center justify-center text-gray-500">
            {isLoading ? 'Loading...' : 'Chart visualization coming soon'}
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-6">
          {/* Current Value Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-400 uppercase tracking-wide">Current Value</p>
              <div>
                <p className="text-4xl font-bold">
                  {isLoading ? '...' : formatCurrency(performance?.currentValue || 0)}
                </p>
                <p className={`text-lg mt-2 ${isDayPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isLoading ? '...' : `${isDayPositive ? '+' : ''}${formatCurrency(dayChange.value)} (${formatPercentage(dayChange.percentage)})`}
                </p>
              </div>
            </div>
          </Card>

          {/* Return Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-400 uppercase tracking-wide">Return</p>
              <div>
                <p className={`text-4xl font-bold ${isReturnPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isLoading ? '...' : formatPercentage(returnData.percentage)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Compared to S&P {spComparison}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Positions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positions Card */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Positions</h2>
            <p className="text-sm text-gray-400">Portfolio allocation</p>
          </div>

          {isLoadingPositions ? (
            <div className="text-center py-8 text-gray-500">Loading positions...</div>
          ) : !positions || positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No positions yet</div>
          ) : (
            <div className="space-y-4">
              {/* Pie Chart Placeholder */}
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart visualization coming soon
              </div>

              {/* Positions Table */}
              <Table>
                <TableBody>
                  {positions.map((position) => {
                    const percentage = performance?.currentValue
                      ? (position.marketValue / performance.currentValue) * 100
                      : 0;

                    return (
                      <TableRow key={position.id}>
                        <TableCell className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>{position.symbol}</span>
                        </TableCell>
                        <TableCell className="text-right">{percentage.toFixed(0)}%</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(position.marketValue)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Activity Card Placeholder */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Activity</h2>
            <p className="text-sm text-gray-400">Recent and queued trades</p>
          </div>
          <div className="text-center py-8 text-gray-500">
            Activity feed coming soon
          </div>
        </Card>
      </div>
    </div>
  );
}
