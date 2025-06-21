import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 text-center dark:text-white">
      <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
      <p className="mt-4 text-lg">This is your protected dashboard.</p>
    </div>
  );
}
