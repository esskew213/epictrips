import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import TripCard from '../components/TripCard';
import { GetServerSideProps } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import prisma from '../lib/prisma';
import { TripCardProps } from '../components/TripCard';
import { useRouter } from 'next/router';
import HeadComponent from '../components/Head';
import { useDebounce } from '../hook/useDebounce';
import TagComponent from '../components/TagComponent';
export const getServerSideProps = async () => {
  const trips = await prisma.trip.findMany({
    where: { public: true },
    include: {
      author: {
        select: { name: true },
      },
      tags: true,
      _count: { select: { likes: true } },
    },
    orderBy: [
      {
        likes: {
          _count: 'desc',
        },
      },
      {
        updatedAt: 'desc',
      },
    ],
  });

  // need to do JSON parse / stringify as next cannot serialize datetime objects
  return { props: { trips: JSON.parse(JSON.stringify(trips)) } };
};

// type Props = {
//   trips: TripCardProps[];
// };

const Home = (props) => {
  // for (let t of props.trips[0].tags) {
  //   t.ta
  // }

  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [tagFilters, setTagFilters] = useState({
    HIKING: false,
    CHILL: false,
    ROMANTIC: false,
    THRILLSEEKING: false,
    ADVENTURE: false,
    SOLO: false,
    ROADTRIP: false,
    FAMILY: false,
  });
  const [results, setResults] = useState(props.trips);
  const [displayedResults, setDisplayedResults] = useState(props.trips);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const debouncedSearchStr = useDebounce(searchStr, 600);

  const handleSelectTag = (e, key) => {
    setTagFilters({ ...tagFilters, [key]: !tagFilters[key] });
  };
  useEffect(() => {
    const tagSet = new Set(
      Object.keys(tagFilters).filter((key) => tagFilters[key] === true)
    );
    if (tagSet.size === 0) {
      setDisplayedResults(results);
    } else {
      const toDisplay = [];
      for (let result of results) {
        for (let tag of result.tags) {
          if (tagSet.has(tag.tag)) {
            toDisplay.push(result);
            break;
          }
        }
      }
      setDisplayedResults(toDisplay);
    }
  }, [tagFilters, results]);
  const handleChange = (e) => {
    if (searchStr.length === 0 && e.target.value === ' ') {
      setSearchStr('');
    } else {
      setSearchStr(e.target.value);
    }
  };
  const searchTrips = async (search) => {
    try {
      setIsSearching(true);
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search.trim()),
      });
      router.replace(router.asPath);
      const data = await res.json();
      setResults(data);
      setIsSearching(false);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(
    () => {
      if (debouncedSearchStr) {
        searchTrips(debouncedSearchStr);
      } else {
        if (debouncedSearchStr.length !== 0) {
          setResults([]);
        } else {
          setResults(props.trips);
        }
        setIsSearching(false);
      }
    },
    [debouncedSearchStr] // Only call effect if debounced search term changes
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchStr.trim()),
      });
      console.log(searchStr);
      router.replace(router.asPath);
      const data = await res.json();
      setResults(data);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };
  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;
  return (
    <div className=''>
      <HeadComponent title={'Search'} />
      <main className='w-screen '>
        <div className='relative flex flex-col py-6 w-full h-60 mx-auto mb-12 justify-center items-center	bg-cover bg-center bg-no-repeat bg-search-photo'>
          <div className='absolute w-full top-0 mx-auto bg-slate-900 h-60 opacity-40'></div>
          <p className='font-serif font-black text-white text-2xl lg:text-4xl mb-6 drop-shadow-lg'>
            It&apos;s going to be <span className='text-yellow-400'>epic</span>.
          </p>

          <form
            onSubmit={handleSubmit}
            className='w-full flex justify-center mx-auto'
          >
            <input
              pattern="^[a-zA-Z\d\s']*"
              className='rounded-full mx-auto w-5/6 h-12 border-none focus:ring-2 focus:ring-cyan-500 drop-shadow-lg'
              type='text'
              value={searchStr}
              onChange={handleChange}
              placeholder='Search for your dream trip'
              autoFocus
            />
          </form>
        </div>

        <div className='w-5/6 mx-auto'>
          <div className='border-b border-b-slate-200 w-full flex flex-wrap justify-between pb-2'>
            <h2 className='text-xl uppercase tracking-wider mr-4 mb-4 lg:mb-0 font-semibold w-fit inline-block'>
              FIND INSPIRATION
            </h2>
            <span className='flex flex-wrap'>
              {Object.keys(tagFilters).map((key, idx) => {
                return (
                  <TagComponent
                    key={idx}
                    name={key}
                    isSelected={tagFilters[key]}
                    handleSelectTag={handleSelectTag}
                  />
                );
              })}
            </span>
          </div>
          <div className='grid w-full place-content-between grid-cols-1 sm:grid-cols-2 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-0'>
            {displayedResults.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                author={trip.author}
                title={trip.title}
                tags={trip.tags}
                budget={trip.budget}
                likes={trip._count?.likes}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
