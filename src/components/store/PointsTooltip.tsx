import React from 'react';

interface PointsTooltipProps {
  isVisible: boolean;
}

const PointsTooltip: React.FC<PointsTooltipProps> = ({ isVisible }) => {
  return (
    <div
      className={`absolute z-50  bg-dark-600/90 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-200 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max text-sm`}
      style={{maxWidth: '250px'}}
    >
      <p className="text-sm">
        Earn <span className="font-bold">1 point</span> for every{' '}
        <span className="font-bold">$5</span> spent. Redeem{' '}
        <span className="font-bold">5 points</span> for a free 2g pre-roll
        (random strain) with free shipping. Must be 21+ to purchase or receive
        any products.
      </p>
    </div>
  );
};

export default PointsTooltip;
