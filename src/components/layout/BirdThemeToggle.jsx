import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import './BirdThemeToggle.css';

export default function BirdThemeToggle() {
  const { dark, setDark } = useTheme();
  const [animating, setAnimating] = useState(false); // false, 'blowing', 'lighting'

  const handleClick = () => {
    if (animating) return;
    setAnimating(dark ? 'lighting' : 'blowing');

    // After bird finishes blowing/lighting (~820ms), flip theme
    setTimeout(() => {
      setDark(prev => !prev);
    }, 820);

    // Animation fully done
    setTimeout(() => {
      setAnimating(false);
    }, 1400);
  };

    return (
    <button
      className={`bird-toggle ${dark ? 'dark-mode' : ''} ${animating ? animating : ''}`}
      onClick={handleClick}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      id="theme-toggle-btn"
    >
      <span className="bird-scene">

        {/* Candle — left side */}
        <span className="candle">
          <span className="candle-body" />
          <span className="candle-wick" />
          <span className="candle-flame"><span className="flame-inner" /></span>
          <span className="candle-smoke">
            <span className="smoke-wisp s1" />
            <span className="smoke-wisp s2" />
            <span className="smoke-wisp s3" />
          </span>
        </span>

        {/* Bird — right side. bird-inner flips it to face LEFT toward candle */}
        <span className="bird">
          <span className="bird-inner">
            <span className="bird-body" />
            <span className="bird-head">
              <span className="bird-eye" />
              <span className="bird-beak">
                {animating === 'lighting' && (
                  <span className="bird-match">
                    <span className="bird-match-head">
                      <span className="bird-match-spark" />
                    </span>
                  </span>
                )}
              </span>
              <span className="bird-cheek" />
            </span>
            <span className="bird-wing" />
            <span className="bird-tail" />
            <span className="bird-feet">
              <span className="foot f1" />
              <span className="foot f2" />
            </span>
          </span>
        </span>

        {/* Air puff particles during blow */}
        {animating === 'blowing' && (
          <span className="blow-puff" aria-hidden="true">
            <span className="puff p1" />
            <span className="puff p2" />
            <span className="puff p3" />
          </span>
        )}
      </span>
    </button>
  );
}
