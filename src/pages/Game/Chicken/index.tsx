import React from 'react';
import Chicken from './Chicken';
import './index.css';

const ChickenGame: React.FC = () => {
  return (
    <div className="game-chicken-container chicken-game-main-wrapper">
      <Chicken />
    </div>
  );
};

export default ChickenGame;
