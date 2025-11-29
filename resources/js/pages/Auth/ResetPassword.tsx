import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

interface ResetPasswordProps {
  token: string;
  email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const [data, setData] = useState({
    token,
    email,
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[a-z]/.test(data.password)) {
      newErrors.password = 'Password must contain lowercase letters';
    } else if (!/[A-Z]/.test(data.password)) {
      newErrors.password = 'Password must contain uppercase letters';
    } else if (!/[0-9]/.test(data.password)) {
      newErrors.password = 'Password must contain numbers';
    } else if (!/[!@#$%^&*]/.test(data.password)) {
      newErrors.password = 'Password must contain symbols (!@#$%^&*)';
    }

    if (!data.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (data.password !== data.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setProcessing(true);

    router.post('/reset-password', data, {
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
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={data.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processing}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be 8+ characters with uppercase, lowercase, numbers, and symbols
            </p>
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processing}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
