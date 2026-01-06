import React, { useState } from 'react';

function Home() {
  const [clicked, setClicked] = useState(false);

  return (
    <main className="home-container">
      <header className="home-header">
        Welcome to My Site
      </header>
      <p className="home-description">
        This is a simple single-page website built with Vite and React. Enjoy exploring and customizing!
      </p>
      <button
        className="home-button"
        onClick={() => setClicked((prev) => !prev)}
      >
        {clicked ? "You clicked me!" : "Click Me"}
      </button>
    </main>
  );
}

export default Home;
