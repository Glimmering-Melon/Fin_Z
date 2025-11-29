import LoginForm from '@/Components/Auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
}
