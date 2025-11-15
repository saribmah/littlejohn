import { Card } from '../../components/ui/card';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to Little John</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
          <p className="text-3xl font-bold">$0.00</p>
          <p className="text-sm text-gray-500 mt-1">+0.00% today</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Agent Status</h3>
          <p className="text-xl font-medium">Inactive</p>
          <p className="text-sm text-gray-500 mt-1">Ready to start</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Connected Brokers</h3>
          <p className="text-xl font-medium">0</p>
          <p className="text-sm text-gray-500 mt-1">Connect a broker to start</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Connect your brokerage account</li>
          <li>Configure your investment preferences</li>
          <li>Choose your agent mode (Manager or Co-Pilot)</li>
          <li>Start managing your portfolio</li>
        </ol>
      </Card>
    </div>
  );
}
