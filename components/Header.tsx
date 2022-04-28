import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
const Header = () => {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <nav className='w-screen tracking-wide bg-cyan-500 text-sm md:text-md font-semibold px-4 py-2 text-white flex flex-row items-center justify-between'>
      {user && (
        <span>
          <span className='inline-block mr-4'>
            <Link href={`/${user.sub}`}>
              <a>
                <img
                  className='w-10 h-10 rounded-full inline-block'
                  src={user?.picture}
                  alt={user?.name}
                />
                <span className='mx-3 sm:inline-block hidden'>
                  Welcome,{' '}
                  <span className='underline'>{user?.name || 'user'}</span>
                </span>
              </a>
            </Link>
          </span>
          <span>
            <Link href={`/${user.sub}`}>
              <a className='mr-4 xs:inline-block hidden'>My Dashboard</a>
            </Link>
            <Link href='/'>
              <a className='ml-4'>Trip Search</a>
            </Link>
          </span>
        </span>
      )}
      {user ? (
        <span className=''>
          <a className='' href='/api/auth/logout'>
            Logout
          </a>
        </span>
      ) : (
        <span className='justify-self-end'>
          <a className='' href='/api/auth/login'>
            Login
          </a>
        </span>
      )}
    </nav>
  );
};

export default Header;
