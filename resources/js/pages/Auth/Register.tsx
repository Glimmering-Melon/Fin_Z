import RegisterForm from '@/Components/Auth/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/Logo-01.png" alt="FinZoo Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">FinZoo</h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>
        
        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <RegisterForm />
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
