import RegisterForm from '@/Components/Auth/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg">
        <RegisterForm />
      </div>
    </div>
  );
}
