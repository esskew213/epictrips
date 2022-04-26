import Link from 'next/link';
import React from 'react';

export type TripCardProps = {
  id: number;
  title: string;
  author: {
    name: string;
  };
  public: boolean;
};

const TripCard = ({ id, title, author, tags }) => {
  return (
    <Link href={`/trip/${id}/summary`}>
      <a>
        <div className='bg-yellow-200 py-4 px-2 m-2 rounded-lg shadow-md max-w-sm w-60'>
          <h5>{title}</h5>
          <h6>by {author.name}</h6>
          {tags && tags.map((tag, idx) => <span key={idx}>{tag.tag}</span>)}
        </div>
      </a>
    </Link>
  );
};

export default TripCard;
