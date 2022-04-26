import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
export type TripCardProps = {
  id: number;
  title: string;
  author: {
    name: string;
  };
  public: boolean;
  budget: string;
  tags: string[];
};

const TripCard = ({ id, title, author, tags, budget }) => {
  return (
    <Link href={`/trip/${id}/summary`}>
      <a>
        <div className='overflow-hidden bg-yellow-400 my-4 rounded-lg drop-shadow-md h-72 w-60 relative hover:-translate-y-2 hover:drop-shadow-lg hover:ring-2 hover:ring-cyan-400/20 transition ease-in-out duration-200'>
          <Image
            src='/images/beach1.jpg'
            alt='beach'
            width='200'
            height='150'
            layout='responsive'
            className='object-cover'
            priority
          />
          <div className='px-2 mt-2'>
            <p className='text-lg tracking-wider font-light '>{title}</p>
            <p className='text-xs font-semibold'>by {author.name}</p>
            <p className='absolute bottom-2 tracking-widest text-lg right-2 font-semibold normalcase'>
              {budget &&
                (budget === 'BUDGET'
                  ? '$'
                  : budget === 'MODERATE'
                  ? '$$'
                  : budget === 'LUXURIOUS'
                  ? '$$$'
                  : null)}
            </p>
            <p className='absolute flex flex-wrap justify-end top-2 right-2 w-full'>
              {tags &&
                tags.map((tag, idx) => (
                  <span
                    className='rounded-full bg-cyan-700 px-2 py-1 tracking-wide text-xs ml-2 mb-2 text-white'
                    key={idx}
                  >
                    {tag.tag}
                  </span>
                ))}
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default TripCard;
