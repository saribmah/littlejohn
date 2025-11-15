import { Link } from 'react-router';
import { SignUpForm } from '../features/auth';

export function Signup() {
  return (
    <>
      <SignUpForm />
      <p className="text-center mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
}
