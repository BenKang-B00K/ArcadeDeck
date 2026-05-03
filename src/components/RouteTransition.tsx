import React from 'react';
import { useLocation } from 'react-router-dom';
import './RouteTransition.css';

const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="route-transition" key={location.pathname}>
      {children}
    </div>
  );
};

export default RouteTransition;
