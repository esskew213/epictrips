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
  _count: { likes: number };
};

const TripCard = ({ id, title, author, tags, budget, likes }) => {
  let lastTag = 'CHILL';
  let sortedTags = [];
  if (tags.length > 0) {
    sortedTags = tags.sort((a, b) => {
      if (a.tag < b.tag) {
        return -1;
      }
      if (a.tag > b.tag) {
        return 1;
      }
      return 0;
    });
    lastTag = sortedTags[sortedTags.length - 1].tag;
  }

  return (
    <div className='mx-auto overflow-hidden shrink-0 bg-yellow-400 my-4 rounded-lg drop-shadow-md h-72 w-60 relative hover:-translate-y-2 hover:drop-shadow-lg hover:ring-2 hover:ring-cyan-400/20 transition ease-in-out duration-200'>
      <Link href={`/trip/${id}/summary`}>
        <a>
          <Image
            src={`/images/${lastTag}.jpg`}
            alt={lastTag}
            width='200'
            height='140'
            layout='responsive'
            className='object-cover'
            priority
          />
          <div className='px-2 mt-2'>
            <p className='text-lg tracking-wider font-light '>{title}</p>
            <p className='text-xs font-semibold'>by {author.name}</p>
            {likes > 0 ? (
              <p className='absolute bottom-2 left-2 bg-red-400 rounded-full text-white  px-2 text-md font-semibold'>
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
              <p className='absolute bottom-2 bg-cyan-500 text-white rounded-full px-2 tracking-widest text-md right-2 font-semibold'>
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
                  className='rounded-full bg-cyan-900 drop-shadow-md px-2 py-1 tracking-wide text-xs ml-2 mb-2 text-white'
                  key={idx}
                >
                  {tag.tag}
                </span>
              ))}
          </p>
        </a>
      </Link>
    </div>
  );
};

export default TripCard;
