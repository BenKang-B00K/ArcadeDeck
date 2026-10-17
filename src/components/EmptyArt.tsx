import React from 'react';

// Decorative mascot for empty / error states; the heading next to it carries the meaning.
const EmptyArt: React.FC<{ pose?: string }> = ({ pose = 'confused' }) => (
  <img className="empty-art" src={`${import.meta.env.BASE_URL}images/mascot/${pose}.webp`} alt="" width={192} height={192} decoding="async" />
);

export default EmptyArt;
