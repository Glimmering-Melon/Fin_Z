import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

interface LoginFormProps {
  onToggleForm?: () => void;
}

export default function LoginForm({ onToggleForm }: LoginFormProps) {
  const [data, setData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setProcessing(true);

    router.post('/login', data, {
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={processing}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
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
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={(e) => setData({ ...data, remember: e.target.checked })}
              className="mr-2"
              disabled={processing}
            />
            <span className="text-sm">Remember me</span>
          </label>

          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Logging in...' : 'Login'}
        </button>

        {onToggleForm && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={onToggleForm}
              className="text-sm text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
