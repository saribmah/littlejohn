import { Link } from 'react-router';
import { LoginForm } from '../features/auth';

export function Login() {
  return (
    <>
      <LoginForm />
      <p className="text-center mt-4 text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
}
