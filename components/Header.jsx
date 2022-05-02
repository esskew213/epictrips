import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
import Image from 'next/image';
const Header = () => {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <nav className='w-screen flex-wrap h-fit md:h-16 border-b border-b-cyan-900 tracking-wide bg-gradient-to-b from-cyan-600 to-cyan-800 bg-cyan-500 text-sm md:text-md font-semibold px-8 py-2 text-white flex flex-row items-center justify-between'>
      {user ? (
        <>
          <span className='inline-block'>
            <span>
              <Link href={`/${user.sub}`}>
                <a>
                  <img
                    className='w-10 h-10 rounded-full inline-block xs:mr-4'
                    src={user?.picture}
                    alt={user?.name}
                  />
                  {/* <span className='mx-3 text-md hidden sm:inline-block '>
                  <span className='font-bold'>{user?.name || 'user'}</span>
                </span> */}
                </a>
              </Link>
            </span>
            <span>
              <Link href={`/${user.sub}`}>
                <a className='mr-4 hidden sm:inline-block text-md'>
                  My Dashboard
                </a>
              </Link>
            </span>
          </span>
          <Link href='/'>
            <a>
              <Image
                src={`/images/epictripslogo.png`}
                alt='logo'
                width='90'
                height='45'
                className='object-contain'
                priority
              />
            </a>
          </Link>
          <span className=''>
            <Link href='/api/auth/logout'>
              <a className='inline-block'>
                <span className='hidden sm:inline-block'>Logout</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 ml-2 text-white inline-block'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
              </a>
            </Link>
          </span>
        </>
      ) : (
        <>
          <Link href='/'>
            <a>
              <Image
                src={`/images/epictripslogo.png`}
                alt='logo'
                width='90'
                height='45'
                className='object-contain'
                priority
              />
            </a>
          </Link>
          <span className='justify-self-end'>
            <Link href='/api/auth/login'>
              <a className='inline-block'>
                <span className='hidden sm:inline-block'>Login</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 ml-2 text-white inline-block'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                  />
                </svg>
              </a>
            </Link>
          </span>
        </>
      )}
    </nav>
  );
};

export default Header;
