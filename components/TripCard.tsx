import React from 'react';

export type TripCardProps = {
  id: number;
  title: string;
  author: {
    name: string;
  };
  destination: string;
  public: boolean;
};

const TripCard = () => {
  return <div></div>;
};

export default TripCard;
