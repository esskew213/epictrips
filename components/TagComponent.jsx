import React from 'react';

const TagComponent = ({ name, isSelected, handleSelectTag }) => {
  return (
    <span
      className={
        isSelected
          ? 'rounded-full px-2 py-1 text-xs font-semibold uppercase bg-cyan-500 mr-2 mb-2'
          : 'rounded-full px-2 py-1 uppercase text-xs font-semibold text-cyan-500 border border-cyan-500 mr-2 mb-2'
      }
      onClick={(e) => {
        handleSelectTag(e, name);
      }}
    >
      {name}
    </span>
  );
};

export default TagComponent;
