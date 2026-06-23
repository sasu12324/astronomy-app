import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';

export const Layout = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};