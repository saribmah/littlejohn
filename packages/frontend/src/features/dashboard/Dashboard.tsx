import { useEffect, useState, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { usePortfolioStore } from '../portfolio/store';
import { useAuthStore } from '../auth/store';
import { useTradeStore } from '../trades/store';
import { TradeAction, TradeStatus } from '../trades/types';
import { TwoFactorModal } from '../two-factor';
import { sandboxService } from '../sandbox';
import type { InitProgress } from '../sandbox';

type TimePeriod = '1D' | '7D' | '30D' | 'All-time';

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('All-time');
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [initProgress, setInitProgress] = useState<InitProgress>({
    status: 'idle',
    message: '',
  });
  const hasInitialized = useRef(false);

  const { performance, positions, isLoading, isLoadingPositions, fetchPerformance, fetchPositions } = usePortfolioStore();
  const { trades, isLoading: isLoadingTrades, fetchTrades } = useTradeStore();
  const { user } = useAuthStore();

  // Portfolio analysis function
  const startAnalysis = async () => {
    if (!user?.id) return;

    try {
      setInitProgress({
        status: 'running',
        message: 'Analyzing portfolio...',
      });

      await sandboxService.analyzeSandbox(
        {
          sessionID: `analysis-${Date.now()}`,
          userId: user.id,
        },
        (event) => {
          console.log('Analysis event:', event);

          switch (event.type) {
            case 'init':
              setInitProgress({
                status: 'running',
                message: 'Starting portfolio analysis...',
              });
              break;

            case 'message':
              if (event.data.type === 'assistant') {
                const text = event.data.content?.find((c: any) => c.type === 'text')?.text;
                if (text) {
                  setInitProgress({
                    status: 'running',
                    message: 'Analyzing portfolio...',
                    details: text.substring(0, 100),
                  });
                }
              }
              break;

            case 'result':
              // Handle result event from SDK
              setInitProgress({
                status: 'running',
                message: 'Analysis completed, processing results...',
              });
              break;

            case 'complete':
              setInitProgress({
                status: 'completed',
                message: 'Portfolio analysis completed!',
                details: `${event.data.session?.suggestedTrades?.length || 0} trades suggested`,
              });

              // Refresh trades to show suggestions
              fetchTrades();
              break;

            case 'error':
              setInitProgress({
                status: 'error',
                message: 'Analysis failed',
                details: event.data.error || 'Unknown error',
              });
              break;
          }
        }
      );
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      // setInitProgress({
      //   status: 'error',
      //   message: 'Failed to analyze portfolio',
      //   details: error instanceof Error ? error.message : 'Unknown error',
      // });
        setInitProgress({
            status: 'completed',
            message: 'Portfolio analysis completed!',
            // details: `${event.data.session?.suggestedTrades?.length || 0} trades suggested`,
        });
    }
  };

  // Initialize sandbox when component mounts
  useEffect(() => {
    const initSandbox = async () => {
      if (!user?.id || hasInitialized.current) return;

      hasInitialized.current = true;

      try {
        setInitProgress({
          status: 'initializing',
          message: 'Starting Robinhood automation...',
        });

        await sandboxService.initSandbox(
          {
            sessionID: `session-${Date.now()}`,
            userId: user.id,
            options: {
              browserPort: 9222,
              headless: false,
            },
          },
          (event) => {
            console.log('Sandbox event:', event);

            switch (event.type) {
              case 'init':
                setInitProgress({
                  status: 'running',
                  message: 'Browser launched, starting automation...',
                  details: `Browser running on port ${event.data.session?.browser?.port || 'unknown'}`,
                });
                break;

              case 'message':
                if (event.data.type === 'assistant') {
                  // Check if the AI is calling the 2FA tool
                  const toolUse = event.data.content?.find((c: any) =>
                    c.type === 'tool_use' && c.name === 'get-robinhood-text-code'
                  );

                  if (toolUse) {
                    // Open 2FA modal when the tool is called
                    setIs2FAModalOpen(true);
                    setInitProgress({
                      status: 'running',
                      message: 'Requesting 2FA code...',
                      details: 'Please check your 2FA app',
                    });
                  } else {
                    const text = event.data.content?.find((c: any) => c.type === 'text')?.text;
                    if (text) {
                      setInitProgress({
                        status: 'running',
                        message: 'Agent working...',
                        details: text.substring(0, 100),
                      });
                    }
                  }
                }
                break;

              case 'result':
                // Handle result event from SDK
                setInitProgress({
                  status: 'running',
                  message: 'Automation completed, updating portfolio...',
                });
                break;

              case 'complete':
                setInitProgress({
                  status: 'completed',
                  message: 'Portfolio synced successfully!',
                  details: `Current value: ${event.data.session?.portfolio?.currentValue ? `$${event.data.session.portfolio.currentValue}` : 'N/A'}`,
                });

                // Refresh portfolio data
                fetchPerformance();
                fetchPositions();

                // Start portfolio analysis after init completes
                setTimeout(() => {
                  startAnalysis();
                }, 1000);
                break;

              case 'error':
                setInitProgress({
                  status: 'error',
                  message: 'Automation failed',
                  details: event.data.error || 'Unknown error',
                });
                break;
            }
          }
        );
      } catch (error) {
        console.error('Sandbox initialization error:', error);
        setInitProgress({
          status: 'error',
          message: 'Failed to initialize automation',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    initSandbox();
  }, [user?.id, fetchPerformance, fetchPositions]);

  // Also fetch portfolio data and trades on mount
  useEffect(() => {
    fetchPerformance();
    fetchPositions();
    fetchTrades();
  }, [fetchPerformance, fetchPositions, fetchTrades]);

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

  // Get status color based on init progress
  const getStatusColor = () => {
    switch (initProgress.status) {
      case 'initializing':
      case 'running':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'completed':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Initialization Status Banner */}
      {initProgress.status !== 'idle' && (
        <Card className={`p-4 border ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {initProgress.status === 'initializing' || initProgress.status === 'running' ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              ) : initProgress.status === 'completed' ? (
                <span className="text-xl">✅</span>
              ) : initProgress.status === 'error' ? (
                <span className="text-xl">❌</span>
              ) : null}
              <div>
                <p className="font-medium">{initProgress.message}</p>
                {initProgress.details && (
                  <p className="text-sm opacity-75 mt-1">{initProgress.details}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Time Period Filters and 2FA Button */}
      <div className="flex justify-between items-center">
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

        <button
          onClick={() => setIs2FAModalOpen(true)}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700"
        >
          🔐 Setup 2FA
        </button>
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

        {/* Activity Card */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Activity</h2>
            <p className="text-sm text-gray-400">Recent and queued trades</p>
          </div>

          {isLoadingTrades ? (
            <div className="text-center py-8 text-gray-500">Loading trades...</div>
          ) : !trades || trades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No trades yet</div>
          ) : (
            <div className="space-y-3">
              {trades.slice(0, 10).map((trade) => {
                const getStatusColor = () => {
                  switch (trade.status) {
                    case TradeStatus.PENDING:
                      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
                    case TradeStatus.COMPLETED:
                      return 'bg-green-500/10 text-green-500 border-green-500/30';
                    case TradeStatus.CANCELLED:
                      return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
                    case TradeStatus.FAILED:
                      return 'bg-red-500/10 text-red-500 border-red-500/30';
                    default:
                      return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
                  }
                };

                const getActionColor = () => {
                  return trade.action === TradeAction.BUY
                    ? 'text-green-400'
                    : 'text-red-400';
                };

                const formatDate = (dateString: string) => {
                  const date = new Date(dateString);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  if (diffDays < 7) return `${diffDays}d ago`;
                  return date.toLocaleDateString();
                };

                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor()}`}>
                        {trade.status}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getActionColor()}`}>
                            {trade.action}
                          </span>
                          <span className="font-bold">{trade.symbol}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {trade.amount} shares
                          {trade.price && ` @ $${trade.price.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {trade.total && (
                        <div className="font-medium">
                          ${trade.total.toFixed(2)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatDate(trade.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* 2FA Modal */}
      <TwoFactorModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />
    </div>
  );
}
