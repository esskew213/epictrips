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
  likes: [liked: boolean];
};

const TripCard = ({ id, title, author, tags, budget, likes }) => {
  const sortedTags = tags.sort((a, b) => {
    if (a.tag < b.tag) {
      return -1;
    }
    if (a.tag > b.tag) {
      return 1;
    }
    return 0;
  });

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
            {likes > 0 ? (
              <p className='text-sm font-semibold'>
                <span>{likes}</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 ml-0.5 inline-block -translate-y-0.5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
                    clipRule='evenodd'
                  />
                </svg>
              </p>
            ) : null}
            {budget && (
              <p className='absolute bottom-2 bg-sky-500 text-white rounded-full px-2 tracking-widest text-md right-2 font-semibold normalcase'>
                {budget === 'BUDGET'
                  ? '$'
                  : budget === 'MODERATE'
                  ? '$$'
                  : budget === 'LUXURIOUS'
                  ? '$$$'
                  : null}
              </p>
            )}
          </div>
          <p className='absolute flex flex-wrap justify-end top-2 right-2 w-full'>
            {tags &&
              sortedTags.map((tag, idx) => (
                <span
                  className='rounded-full bg-cyan-700 px-2 py-1 tracking-wide text-xs ml-2 mb-2 text-white'
                  key={idx}
                >
                  {tag.tag}
                </span>
              ))}
          </p>
        </div>
      </a>
    </Link>
  );
};

export default TripCard;
