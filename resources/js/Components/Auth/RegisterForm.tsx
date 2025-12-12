import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

interface RegisterFormProps {
  onToggleForm?: () => void;
}

export default function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.name) {
      newErrors.name = 'Name is required';
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }

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

    router.post('/register', data, {
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 text-sm mt-2">Join thousands of investors</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={processing}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        {onToggleForm ? (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <button
              type="button"
              onClick={onToggleForm}
              className="text-sm text-blue-600 hover:underline"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Sign in
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
