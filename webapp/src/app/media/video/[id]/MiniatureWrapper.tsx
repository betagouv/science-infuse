import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MiniatureWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const [isSticky, setIsSticky] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [elementHeight, setElementHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            if (wrapperRef.current) {
                const contentElement = wrapperRef.current.querySelector('.content-wrapper');
                if (contentElement) {
                    setElementHeight(contentElement.clientHeight+80);
                }
            }
        };

        const options = {
            threshold: 0,
            rootMargin: "-200px 0px 0px 0px"
        };

        const element = wrapperRef.current;
        observerRef.current = new IntersectionObserver(([entry]) => {
            console.log('intersection:', !entry.isIntersecting);
            setIsSticky(!entry.isIntersecting);
        }, options);

        if (element) {
            observerRef.current.observe(element);
            updateHeight();
        }

        // Add resize listener to handle dynamic content changes
        window.addEventListener('resize', updateHeight);

        return () => {
            if (observerRef.current && element) {
                observerRef.current.unobserve(element);
                observerRef.current.disconnect();
            }
            window.removeEventListener('resize', updateHeight);
        };
    }, []);

    return (
        <div ref={wrapperRef} style={{ height: elementHeight }}>
            <motion.div
                className={`content-wrapper ${className}`}
                animate={isSticky ? {
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    width: 400,
                    height: 250,
                    zIndex: 9999,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderRadius: '0.5rem',
                    scale: 0.8
                } : {
                    position: 'relative',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    boxShadow: 'none',
                    borderRadius: 0,
                    scale: 1
                }}
                transition={{
                    duration: 0,
                    //   ease: 'easeInOut'
                }}
                style={{
                    transformOrigin: 'top right'
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default MiniatureWrapper;