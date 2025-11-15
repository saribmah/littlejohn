import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function UserProfile() {
  // TODO: Get user from Better Auth session
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  const handleSignOut = () => {
    // TODO: Implement Better Auth sign out
    console.log('Sign out');
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>
    </Card>
  );
}
