import React from 'react';

const Footer = () => {
  return (
    <footer className='absolute bottom-0 mt-12 w-screen h-fit tracking-wide bg-slate-100 text-xs font-light px-8 py-2 text-slate-500 flex flex-row flex-wrap items-start justify-between'>
      <span className='p-1'>
        Copyright &copy; 2022 Sarah Quek. A capstone project for General
        Assembly Singapore&apos;s SEI-35.
      </span>
      <span className='p-1'>
        Powered by{' '}
        <a className='font-semibold' href='https://nextjs.org/'>
          NextJS
        </a>
        ,{' '}
        <a className='font-semibold' href='https://supabase.com/'>
          Supabase
        </a>{' '}
        <a className='font-semibold' href='https://auth0.com/'>
          Auth0
        </a>
        , and{' '}
        <a className='font-semibold' href='https://www.prisma.io/'>
          Prisma
        </a>
        . Styled with{' '}
        <a className='font-semibold' href='https://tailwindcss.com/'>
          Tailwind CSS
        </a>
        .
      </span>
    </footer>
  );
};

export default Footer;
