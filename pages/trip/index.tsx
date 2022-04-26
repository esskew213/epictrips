import React, { useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Router from 'next/router';
import TableDatePicker from '../../components/TableDatePicker';
import { useUser } from '@auth0/nextjs-auth0';
import Loader from '../../components/Loader';

const Trip = () => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const { user, error, isLoading } = useUser();
  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
  };
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const body = { title, startDate };
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
        <button>Create</button>
      </form>
    </>
  );
};

export default withPageAuthRequired(Trip);
