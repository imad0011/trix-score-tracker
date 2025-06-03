import React from 'react';

const GameStatus = ({ statusText }) => (
  <div className="text-center mt-2 text-sm text-muted-foreground">
    {statusText}
  </div>
);

export default GameStatus;