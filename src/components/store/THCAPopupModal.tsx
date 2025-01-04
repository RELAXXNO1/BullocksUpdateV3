import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, X, PlayCircle, PauseCircle } from 'lucide-react';

interface THCAPopupModalProps {
  onClose: () => void;
  videoPath: string;
  autoExpandInterval?: number; // Time in ms between auto-expansions
  expandDuration?: number; // How long the modal stays expanded during auto-expansion
}

const THCAPopupModal: React.FC<THCAPopupModalProps> = ({
  onClose,
  videoPath,
  autoExpandInterval = 60000, // Default 1 minute
  expandDuration = 10000, // Default 10 seconds
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play();
    }
  }, [showVideo]);
  const autoExpandTimeoutRef = useRef<NodeJS.Timeout>();
  const collapseTimeoutRef = useRef<NodeJS.Timeout>();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Auto-expansion effect
  useEffect(() => {
    const startAutoExpand = () => {
      autoExpandTimeoutRef.current = setInterval(() => {
        if (!isExpanded) {
          setIsExpanded(true);
          // Collapse after expandDuration
          collapseTimeoutRef.current = setTimeout(() => {
            if (!isDragging) {
              setIsExpanded(false);
              setShowVideo(false);
            }
          }, expandDuration);
        }
      }, autoExpandInterval);
    };

    startAutoExpand();

    return () => {
      if (autoExpandTimeoutRef.current) clearInterval(autoExpandTimeoutRef.current);
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    };
  }, [autoExpandInterval, expandDuration, isDragging]);

  // Handle video playback
  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setShowVideo(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setProgress(0);
    setIsPlaying(false);
  };

  const bubbleVariants = {
    expanded: {
      scale: 1,
      opacity: 1,
      width: 'auto',
      height: 'auto',
      borderRadius: '1rem',
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    collapsed: {
      scale: 1,
      opacity: 1,
      width: '48px',
      height: '48px',
      borderRadius: '9999px',
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="fixed pointer-events-auto z-[1003]"
      style={{ bottom: '1rem', right: '1rem' }}
      initial={false}
      drag={!isExpanded}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event: any, info: any) => {
        setIsDragging(false);
        setPosition({
          x: position.x + info.offset.x,
          y: position.y + info.offset.y
        });
      }}
      animate={{
        x: position.x,
        y: position.y
      }}
    >
      <motion.div
        variants={bubbleVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        whileHover={!isExpanded ? "hover" : undefined}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`
          ${isExpanded
            ? 'bg-dark-600/20 backdrop-blur-xl border border-dark-400/10 p-4 max-w-sm w-full'
            : 'bg-dark-600/50 backdrop-blur-xl flex items-center justify-center cursor-pointer'}
          shadow-[0_0_10px_theme(colors.teal.500/0.5)]
        `}
      >
        {!isExpanded ? (
          <HelpCircle className="w-6 h-6 text-white" />
        ) : (
          <div className="relative z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.500/0.05),transparent_70%)]" />
            
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-bold text-white">Learn About THC-A</h2>
                <button 
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center">
                <p className="mb-4 text-gray-300">Want to learn more about THC-A?</p>
                
                {!showVideo ? (
                  <button
                    onClick={() => {
                      setShowVideo(true);
                      if (videoRef.current) {
                        videoRef.current.play();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-colors duration-200"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Watch Video
                  </button>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black/20 max-w-full max-h-[40vh]">
                      <video
                        ref={videoRef}
                        src={videoPath}
                        className={`w-full rounded-lg transition-opacity duration-200 ${isPlaying ? 'opacity-100' : 'opacity-90'}`}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={() => {
                          if (videoRef.current) {
                            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                          }
                        }}
                        onError={() => setVideoError('Error loading video')}
                        playsInline
                        muted={isMuted}
                      />
                      
                      {videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-red-500">
                          <p>{videoError}</p>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlayback}
                            className="text-white hover:text-teal-400 transition-colors"
                            aria-label={isPlaying ? 'Pause video' : 'Play video'}
                          >
                            {isPlaying ? (
                              <PauseCircle className="w-6 h-6" />
                            ) : (
                              <PlayCircle className="w-6 h-6" />
                            )}
                          </button>
                          
                          <button
                            onClick={toggleMute}
                            className="text-white hover:text-teal-400 transition-colors"
                            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              {isMuted ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              ) : (
                                <>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </>
                              )}
                            </svg>
                          </button>
                          
                          <div className="flex-1 mx-2">
                            <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500 transition-all duration-200"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default THCAPopupModal;
