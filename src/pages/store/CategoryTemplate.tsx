import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useProducts } from '../../hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import ProductGrid from '../../components/store/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import SlideshowBackground from '../../components/ui/SlideshowBackground';
interface CategoryAttributeField {
  name: string;
  label: string;
  type: string;
  options?: string[];
  description?: string;
}

interface CategoryConfig {
  name: string;
  slug: string;
  description?: string;
  attributes?: {
    fields: CategoryAttributeField[];
  };
}

interface CategoryTemplateProps {
  categorySlug: string;
}

export default function CategoryTemplate({ categorySlug }: CategoryTemplateProps): React.ReactElement {
  const { products, loading } = useProducts();
  const navigate = useNavigate(); 
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  // Enhanced scroll configuration for touch and mobile
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    container: containerRef,
    offset: ["start start", "end start"],
    smooth: 15, // Increased smoothness
    layoutEffect: false
  });

  // More sophisticated parallax and scroll transformations
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"], {
    ease: (progress: number) => Math.pow(progress, 2) // Quadratic easing for smoother parallax
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"], {
    ease: (progress: number) => 1 - Math.pow(1 - progress, 3) // Cubic ease-out for text movement
  });

  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [1, 1, 1, 1], 
    {
      ease: (progress: number) => progress // Linear interpolation for opacity
    }
  );

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95], {
    ease: (progress: number) => 1 - Math.pow(progress, 2) // Subtle scaling effect
  });

  // Scroll-triggered animations for sections
  const sectionVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  // Remove scroll event logging for debugging
  useMotionValueEvent(scrollYProgress, "change", () => {});

  // Determine category details
  const categoryDetails: CategoryConfig = useMemo(() => {
    const foundCategory = DEFAULT_CATEGORIES.find(cat => 
      cat.slug === categorySlug || 
      cat.name.toLowerCase().includes(categorySlug.toLowerCase())
    );

    if (!foundCategory) {
      console.warn(' Category Not Found, Attempting Fallback:', {
        inputSlug: categorySlug,
        availableSlugs: DEFAULT_CATEGORIES.map(cat => cat.slug)
      });
    }

    return foundCategory || DEFAULT_CATEGORIES[0];
  }, [categorySlug]);

  // Filter products for the category
  const filteredProducts = useMemo(() => {
    if (!categoryDetails) return [];
    
    const filtered = products.filter(product => {
      return product.category === categoryDetails.slug;
    });

    return filtered;
  }, [products, categoryDetails]);

  // If no matching category found, return fallback
  if (!categoryDetails) {
    const fallbackCategory: CategoryConfig = DEFAULT_CATEGORIES[0];
    
    return (
      <div className="text-red-500 p-4">
        <h2>Category "{categorySlug}" not found.</h2>
        <p>Showing default category: {fallbackCategory.name}</p>
        <ProductGrid products={filteredProducts} />
      </div>
    );
  }

  // Validate category name for product filtering
  if (!categoryDetails.name) {
    console.error(' Invalid Category Configuration:', categoryDetails);
    throw new Error(`Category "${categorySlug}" is missing a name`);
  }

  // Add a method to use handleGoBack
  const handleGoBack = () => {
    navigate('/store');
    console.log('Navigating back to store');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen overflow-x-hidden touch-pan-y"
    >
      {/* Gradient Background with Enhanced Parallax */}
      <motion.div 
        style={{ 
          y: backgroundY,
          opacity: opacity,
          scale: scale
        }}
        className="absolute inset-0 bg-gradient-to-br from-dark-600 via-dark-500 to-dark-600 will-change-transform"
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,theme(colors.teal.500/0.15),transparent)] pointer-events-none" />

      {/* Category Header with Scroll-Triggered Animation */}
      {categoryDetails && (
        <motion.section 
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          style={{ y: textY }}
          className="relative z-10 px-3 py-6 sm:px-4 sm:py-8 md:px-8 will-change-transform"
        >
          {/* Back button and category content */}
          <div className="container mx-auto">
            <button 
              onClick={handleGoBack} 
              className="mb-4 flex items-center text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              Back to Store
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
              {categoryDetails.name}
            </h1>
            {categoryDetails.description && (
              <p className="text-gray-300 mb-6">
                {categoryDetails.description}
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* Product Grid Section with Scroll Animation */}
      <motion.div 
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        className="relative z-20 px-4 py-8 md:px-8"
      >
        {/* Existing product grid content */}
        <ProductGrid 
          products={filteredProducts} 
          initialCategory={categoryDetails.name} 
        />
      </motion.div>

      {/* Attribute Showcase Section */}
      {categoryDetails.attributes?.fields && categoryDetails.attributes.fields.length > 0 && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ 
            once: true,  // Only animate once when in view
            amount: 0.1  // Trigger when 10% of the section is visible
          }}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1  // Stagger the children animations
              }
            }
          }}
          className="container mx-auto px-4 py-16 bg-gradient-to-br from-slate-900 to-slate-800 relative z-20"
        >
          <motion.h2 
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.5
                }
              }
            }}
            className="text-3xl font-bold text-center text-white mb-12"
          >
            {categoryDetails.name} Attributes
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {categoryDetails.attributes.fields.map((attr: CategoryAttributeField, index: number) => (
              <motion.div 
                key={attr.name}
                variants={{
                  hidden: { scale: 0.9 },
                  visible: { 
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut"
                    }
                  }
                }}
                className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: { 
                        scale: 1, 
                        opacity: 1,
                        transition: { 
                          type: "spring", 
                          stiffness: 260, 
                          damping: 20,
                          delay: 0.2
                        }
                      }
                    }}
                    className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mr-4"
                  >
                    <span className="text-teal-600 font-bold text-lg">
                      {attr.label.charAt(0)}
                    </span>
                  </motion.div>
                  <motion.h3 
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          duration: 0.4
                        }
                      }
                    }}
                    className="text-xl font-semibold text-white group-hover:text-teal-400 transition-colors"
                  >
                    {attr.label}
                  </motion.h3>
                </div>
                
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.5,
                        delay: 0.3
                      }
                    }
                  }}
                  className="text-slate-300"
                >
                  {attr.type === 'select' && attr.options ? (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { 
                          opacity: 1,
                          transition: { 
                            delay: 0.4 
                          }
                        }
                      }}
                    >
                      <p className="mb-2">Available Options:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {attr.options.map((option) => (
                          <motion.li 
                            key={option} 
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              visible: { 
                                opacity: 1, 
                                x: 0,
                                transition: { 
                                  type: "tween",
                                  duration: 0.3
                                }
                              }
                            }}
                            className="text-sm"
                          >
                            {option}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : (
                    <motion.p 
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { 
                          opacity: 1,
                          transition: { 
                            delay: 0.4 
                          }
                        }
                      }}
                      className="italic"
                    >
                      Type: {attr.type === 'number' ? 'Numeric Value' : 
                             attr.type === 'text' ? 'Text Description' : 
                             attr.type === 'boolean' ? 'Yes/No Option' : attr.type}
                    </motion.p>
                  )}
                  {attr.description && (
                    <motion.p
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            delay: 0.5
                          }
                        }
                      }}
                      className="text-sm text-slate-500 dark:text-slate-400 mt-2"
                    >
                      {attr.description}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
      <div ref={scrollRef} className="absolute inset-0" />
    </div>
  );
}
