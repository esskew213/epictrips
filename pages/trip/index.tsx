import React, { useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Router from 'next/router';
import TableDatePicker from '../../components/TableDatePicker';
import { useUser } from '@auth0/nextjs-auth0';
import Loader from '../../components/Loader';
import HeadComponent from '../../components/Head';

const Trip = () => {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('BUDGET');
  const [startDate, setStartDate] = useState(new Date());
  const [tags, setTags] = useState({
    HIKING: false,
    SOLO: false,
    ROADTRIP: false,
    ROMANTIC: false,
    FAMILY: false,
    THRILLSEEKING: false,
    CHILL: false,
  });
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
      const res = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setTitle('');
      const data = await res.json();
      await Router.push(`/trip/${data.id}`);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <HeadComponent title={'Create Trip'} />
      <div>
        <h2 className='text-2xl py-4 mb-4'>Create new trip</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor='title' className='mr-4'>
          Give your trip a title:
        </label>
        <input
          id='title'
          autoFocus
          className='form-input border-slate-100 rounded-md mb-4'
          placeholder='title of your trip'
          type='text'
          required
          value={title}
          onChange={handleTitleChange}
        />
        <fieldset className='mb-4'>
          <span className='mr-4'>When does your trip start?</span>
          <TableDatePicker
            date={startDate}
            onInputChange={handleStartDateChange}
          />
        </fieldset>
        <fieldset className='mb-4'>
          <label className='mr-4' htmlFor='budget'>
            How fancy is your trip?
          </label>
          <select
            className='border-slate-100 rounded-md'
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
          <legend>Categorise your trip!</legend>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='hiking'
            name='tag[]'
            value='HIKING'
            checked={tags.HIKING}
          />
          <label htmlFor='hiking'>Hiking</label>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='solo'
            name='tag[]'
            value='SOLO'
            checked={tags.SOLO}
          />
          <label htmlFor='solo'>Solo</label>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='roadtrip'
            name='tag[]'
            value='ROADTRIP'
            checked={tags.ROADTRIP}
          />
          <label htmlFor='roadtrip'>Roadtrip</label>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='romantic'
            name='tag[]'
            value='ROMANTIC'
            checked={tags.ROMANTIC}
          />
          <label htmlFor='romantic'>Romantic</label>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='family'
            name='tag[]'
            value='FAMILY'
            checked={tags.FAMILY}
          />
          <label htmlFor='family'>Family</label>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='thrillseeking'
            name='tag'
            value='THRILLSEEKING'
            checked={tags.THRILLSEEKING}
          />
          <label htmlFor='thrillseeking'>Thrillseeking</label>
          <input
            onChange={handleTagsChange}
            type='checkbox'
            id='chill'
            name='tag'
            value='CHILL'
            checked={tags.CHILL}
          />
          <label htmlFor='chill'>Chill</label>
        </fieldset>
        <div>
          <button className='px-2 py-1 rounded-md bg-yellow-400 transition ease-in-out duration-150 hover:shadow-md hover:-translate-y-1 hover:bg-orange-400'>
            Create
          </button>
        </div>
      </form>
    </>
  );
};

export default withPageAuthRequired(Trip);
