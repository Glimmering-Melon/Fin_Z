import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

interface ForgotPasswordProps {
  status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email is invalid' });
      return;
    }

    setProcessing(true);
    setErrors({});

    router.post('/forgot-password', { email }, {
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        
        <p className="text-gray-600 text-sm mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {status && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processing}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center mt-4">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
