import React from 'react';
import { useLocation } from 'react-router-dom';
import './MascotBg.css';

// Deck the robot, one pose per section; art in public/images/mascot/<pose>.webp.
const POSE_BY_SECTION: Record<string, string> = {
  '': 'wave', 'my-games': 'cheer', blog: 'think', about: 'thumbs', contact: 'wave', patchnote: 'fly', genre: 'run',
};

// Faint fixed-corner decoration behind page content. Pages not listed (game pages, 404, legal) get none.
const MascotBg: React.FC = () => {
  const section = useLocation().pathname.split('/')[1] ?? '';
  const pose = POSE_BY_SECTION[section];
  if (!pose) return null;
  return (
    <img
      key={pose}
      className="mascot-bg"
      src={`${import.meta.env.BASE_URL}images/mascot/${pose}.webp`}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
};

export default MascotBg;
