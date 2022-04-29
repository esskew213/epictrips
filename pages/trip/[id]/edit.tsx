import React, { useState, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import TableDatePicker from '../../../components/TableDatePicker';
import { useUser } from '@auth0/nextjs-auth0';
import Loader from '../../../components/Loader';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';
import HeadComponent from '../../../components/Head';
export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context) => {
    const id = parseInt(context.params.id);
    const { req, res } = context;
    const { user } = getSession(req, res);
    // retrieve the trip
    try {
      const trip = await prisma.trip.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          author: {
            select: { name: true },
          },
          tags: {
            select: { tag: true },
          },
        },
      });
      // check if authorised
      if (!trip || trip.authorId !== user.sub) {
        return {
          redirect: {
            permanent: false,
            destination: '/',
          },
        };
      }

      const allTags = {
        HIKING: false,
        SOLO: false,
        ROADTRIP: false,
        ROMANTIC: false,
        FAMILY: false,
        THRILLSEEKING: false,
        CHILL: false,
      };
      for (let el of trip.tags) {
        allTags[el['tag']] = true;
      }
      return {
        props: {
          trip: JSON.parse(JSON.stringify(trip)),
          allTags,
        },
      };
    } catch (err) {
      console.error(err);
    }
  },
});

//*******************************
const Trip = ({ trip, allTags }) => {
  const [title, setTitle] = useState(trip?.title || null);
  const [budget, setBudget] = useState(trip?.budget || null);
  const [startDate, setStartDate] = useState(
    new Date(trip?.startDate) || new Date()
  );
  const [tags, setTags] = useState(allTags);
  console.log(trip.tags);
  console.log(tags);
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
  };
  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };
  const handleTagsChange = (e) => {
    setTags({ ...tags, [e.target.value]: !tags[e.target.value] });
    console.log(tags);
  };
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const body = { title, startDate, tags, budget };
    try {
      const res = await fetch(`/api/trip/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await router.push(`/trip/${trip.id}`);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <HeadComponent title={'Edit Trip'} />
      <main className='mx-auto w-full xs:w-5/6 md:w-4/6 lg:w-1/3 bg-slate-100 my-8 p-4'>
        <h2 className='text-2xl md:text-3xl xl:text-4xl font-serif text-cyan-700 py-4 mb-4'>
          Edit trip details
        </h2>

        <form className='flex flex-col relative' onSubmit={handleSubmit}>
          <div>
            {/* <label htmlFor='title' className='mr-4'>
            Give your trip a title:
          </label> */}
            <input
              id='title'
              autoFocus
              className='form-input border-slate-100 rounded-full mb-4 w-full drop-shadow-md'
              placeholder='title of your trip'
              type='text'
              required
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <fieldset className='mb-4 flex justify-between md:justify-start items-center w-full'>
            <span className='text-sm font-semibold mr-8'>
              Start date
              <br />
              <span className='italic text-xs'>
                (you can always change this later)
              </span>
            </span>
            <TableDatePicker
              date={startDate}
              onInputChange={handleStartDateChange}
            />
          </fieldset>
          <fieldset className='mb-4 flex justify-between md:justify-start items-center '>
            <label className='text-sm font-semibold mr-8' htmlFor='budget'>
              Trip budget
            </label>
            <select
              className='border-slate-100 rounded-full mb-4 drop-shadow-md'
              onChange={handleBudgetChange}
              name='budget'
              id='budget'
            >
              <option value='BUDGET'>Budget</option>
              <option value='MODERATE'>Moderate</option>
              <option value='LUXURIOUS'>Luxurious</option>
            </select>
          </fieldset>
          <fieldset className='mb-4'>
            <legend className='text-sm font-semibold mb-2'>
              Add tags to your trip!
            </legend>
            <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 place-content-evenly gap-y-1'>
              {Object.keys(tags).map((key, idx) => {
                return (
                  <React.Fragment key={idx}>
                    <span className='w-full flex items-center'>
                      <input
                        className='mr-2 rounded-full border-cyan-500'
                        onChange={handleTagsChange}
                        type='checkbox'
                        id={key}
                        name='tag[]'
                        value={key}
                        checked={tags[key]}
                      />
                      <label htmlFor={key}>{key.toLowerCase()}</label>
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </fieldset>

          <button className='px-2 py-1 text-sm font-semibold w-full sm:w-fit sm:self-end rounded-md bg-yellow-400 transition ease-in-out duration-250 hover:shadow-md hover:text-white hover:bg-yellow-500'>
            Update Trip
          </button>
        </form>
      </main>
    </>
  );
};

export default withPageAuthRequired(Trip);
