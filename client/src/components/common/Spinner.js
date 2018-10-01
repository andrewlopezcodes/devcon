import React from 'react';
import spinner from './devconloading.gif';

export default ()=>{
  return (
    <div>
      <img
        src={spinner}
        style={{
          width: '100px',
          margin: 'auto',
          display: 'block'
        }}
        alt="Loading..."
      />
      <p>Loading...</p>
    </div>
  );
};
