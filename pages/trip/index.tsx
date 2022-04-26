import React, { useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Router from 'next/router';
import TableDatePicker from '../../components/TableDatePicker';
import { useUser } from '@auth0/nextjs-auth0';
import Loader from '../../components/Loader';

const Trip = () => {
  const [title, setTitle] = useState('');
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
  const handleTagsChange = (e) => {
    setTags({ ...tags, [e.target.value]: !tags[e.target.value] });
    console.log(tags);
  };
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const body = { title, startDate, tags };
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
      <div>
        <h2>Create new trip</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className='form-input'
          placeholder='title of your trip'
          type='text'
          required
          value={title}
          onChange={handleTitleChange}
        />
        <TableDatePicker
          date={startDate}
          onInputChange={handleStartDateChange}
        />
        <fieldset>
          <legend>Select tags</legend>
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
          <button>Create</button>
        </div>
      </form>
    </>
  );
};

export default withPageAuthRequired(Trip);
