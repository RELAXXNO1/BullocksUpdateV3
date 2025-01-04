import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartToggle } from '../../contexts/CartToggleContext';
import { useCart } from '../../contexts/CartContext';
import UserMenu from '../ui/UserMenu';
import CartModal from './CartModal';
import { motion } from 'framer-motion';
import { LOGO_PATH } from '../../config/constants';
import { FunctionComponent, ReactNode, JSX } from 'react';

// Constants moved outside component to prevent recreating on each render
const ANIMATION_INTERVAL = 4000;
const ANIMATION_DURATION = 1500;
const WORDS = ['Wellness', 'Mentality', 'Mood', 'Self'] as const;
const PARALLAX_FACTOR = 0.4;

// Define the word type
type AnimationWord = typeof WORDS[number];

// Custom hook for managing word animation state
const useWordAnimation = () => {
  const [currentWord, setCurrentWord] = useState<AnimationWord>(WORDS[0]);
  const [nextWord, setNextWord] = useState<AnimationWord>(WORDS[1]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const animate = () => {
      setIsAnimating(true);
      currentIndex = (currentIndex + 1) % WORDS.length;
      const nextIndex = (currentIndex + 1) % WORDS.length;

      const current = WORDS[currentIndex] as AnimationWord;
      const next = WORDS[nextIndex] as AnimationWord;

      setCurrentWord(current);
      setNextWord(next);

      timeoutId = setTimeout(() => {
        setIsAnimating(false);
        timeoutId = setTimeout(animate, ANIMATION_INTERVAL - ANIMATION_DURATION);
      }, ANIMATION_DURATION);
    };

    timeoutId = setTimeout(animate, ANIMATION_INTERVAL);
    return () => clearTimeout(timeoutId);
  }, []);

  return { currentWord, nextWord, isAnimating };
};

// Type definitions for better type safety
interface HeaderProps {
  className?: string;
}

// Memoized navigation link component
const NavLink: FunctionComponent<{ to: string; children: ReactNode }> = memo(function NavLink({ to, children }): JSX.Element | null {
  return (
    <Link
      to={to}
      className="hover:text-teal-300 transition-colors duration-200 relative group overflow-hidden bg-dark-600/50 rounded-md px-3 py-2 before:absolute before:inset-0 before:bg-teal-500/10 before:opacity-0 before:transition-opacity before:rounded-md hover:before:opacity-100 active:before:opacity-20"
      role="menuitem"
    >
      <span className="block">{children}</span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-300 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden="true"
      />
    </Link>
  );
});

NavLink.displayName = 'NavLink';


export const StoreHeader = memo(({ className = '' }: HeaderProps) => {
  const { user } = useAuth();
  const { isCartEnabled, setCartEnabled } = useCartToggle();
  const { cart } = useCart();
  const headerRef = useRef<HTMLElement>(null);
  const { currentWord, nextWord, isAnimating } = useWordAnimation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Memoized cart toggle handler
  const toggleCart = useCallback(() => {
    setCartEnabled(!isCartEnabled);
  }, [isCartEnabled, setCartEnabled]);

    const toggleUserMenu = useCallback(() => {
        setIsUserMenuOpen(!isUserMenuOpen);
    }, [isUserMenuOpen]);

    const closeUserMenu = useCallback(() => {
        setIsUserMenuOpen(false);
    }, []);

  // CSS Custom Properties for dynamic animations
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.setProperty('--animation-duration', `${ANIMATION_DURATION}ms`);
    }
  }, []);

  // Optimized scroll handler with RAF for better performance
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (headerRef.current) {
          const scrollY = window.scrollY;
          headerRef.current.style.backgroundPositionY = `${scrollY * PARALLAX_FACTOR}px`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`relative bg-green-400/10 backdrop-blur-md border-b border-green-300/30 overflow-hidden transition-all duration-300 mb-4 z-50 ${className}`}
      role="banner"
      style={{ height: '70px' }} // Slightly increased header height
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.1),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="container relative mx-auto px-6 py-2 flex justify-between items-center z-10" style={{ height: '70px' }}> {/* Adjusted py to match */}
        <Link
          to="/"
          className="flex items-center transform transition-transform hover:scale-105"
          aria-label="High10 Wellness Home"
        >
          <motion.img
            src={LOGO_PATH}
            alt="High10 Wellness Logo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="h-16 mr-4 drop-shadow-[0_0_8px_theme(colors.teal.500)]" // Reduced logo size
            loading="eager"
            width={64}
            height={64}
          />
          <span className="font-extrabold text-2xl tracking-wider uppercase">
            <span className="text-black drop-shadow-[0_0_4px_theme(colors.teal.500)]">High</span>
            <span className="text-teal-500 drop-shadow-[0_0_4px_black] text-shadow-[0_0_2px_black]">10</span>
            <span className="ml-2 text-black drop-shadow-[0_0_4px_theme(colors.teal.500)] relative">
              <span
                className={`
                  block transform transition-all duration-500 ease
                  ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
                `}
                style={{ position: 'absolute', top: 0, left: 0, right: 0 }} // Ensure same x-axis
              >
                {currentWord}
              </span>
              <span className="absolute inset-0 flex items-center justify-start">
                <span
                  className={`
                    block transform transition-all duration-500 ease
                    ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
                  `}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0 }} // Ensure same x-axis
                >
                  {nextWord}
                </span>
              </span>
              <span className="invisible">{currentWord}</span>
            </span>
          </span>
        </Link>

        <nav className="flex items-center space-x-8 text-lg font-semibold text-gray-100" role="navigation"> {/* Reduced space-x */}
          <div role="menu" className="flex items-center space-x-8">
            <NavLink to="/products">Products</NavLink>

            <NavLink to="mailto:high10.verify@gmail.com">Contact Us</NavLink>
            <NavLink to="/login">Sign In</NavLink>
          </div>
          {user && <UserMenu isOpen={isUserMenuOpen} onClose={toggleUserMenu} closeMenu={closeUserMenu} showAdminLink={true} />}
        </nav>
      </div>

      {isCartEnabled && <CartModal isOpen={isCartEnabled} onClose={toggleCart} />}
    </header>
  );
});

StoreHeader.displayName = 'StoreHeader';

export default StoreHeader;
