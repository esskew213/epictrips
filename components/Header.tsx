import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
const Header = () => {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <nav className='w-screen font-rubik tracking-wide bg-cyan-700 px-2 py-4 text-white'>
      {user && (
        <span className='inline-block'>
          <img
            className='w-10 h-10 rounded-full inline'
            src={user.picture}
            alt={user.name}
          />
          <span>{user.name}</span>
          <Link href='/'>
            <a className='p-3'>Search</a>
          </Link>
          <Link href={`/${user.sub}`}>
            <a className='p-3'>My Dashboard</a>
          </Link>
        </span>
      )}
      {user ? (
        <a className='p-3' href='/api/auth/logout'>
          Logout
        </a>
      ) : (
        <a className='p-3' href='/api/auth/login'>
          Login
        </a>
      )}
    </nav>
  );
};

export default Header;
