import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-50 chinese-pattern">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
