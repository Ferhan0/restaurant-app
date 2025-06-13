import React from 'react';

const RestaurantList = () => {
  return (
    <div className="restaurant-list-page">
      <div className="container">
        <h1>Restaurants</h1>
        <p>Restaurant list will be displayed here when the backend is connected.</p>
        <div className="placeholder-content">
          <h3>Sample Restaurant</h3>
          <p>This is where restaurants will be listed after connecting to the API.</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;