import { useEffect, useState, useRef, ReactNode } from "react";

interface StickyShadowProps {
    children: ReactNode;
    className?: string;
    shadowClass?: string;
    position?: 'top' | 'bottom';
}

const StickyShadow = ({ 
    children, 
    className = "", 
    shadowClass,
    position = 'top'
}: StickyShadowProps) => {
    const [isSticky, setIsSticky] = useState(false);
    const stickyRef = useRef<HTMLDivElement | null>(null);
    const defaultShadow = position === 'bottom' ? "shadow-[0_-4px_2px_-2px_var(--border-default-grey)]" : "shadow-[0_4px_2px_-2px_var(--border-default-grey)]";

    useEffect(() => {
        const handleScroll = () => {
            if (!stickyRef.current) return;
            const rect = stickyRef.current.getBoundingClientRect();
            if (position === 'top') {
                setIsSticky(rect.top <= 0);
            } else {
                setIsSticky(rect.bottom >= window.innerHeight);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [position]);

    return (
        <div
            ref={stickyRef}
            className={`sticky ${position}-0 bg-white z-[2] py-2 transition-shadow ${className} ${isSticky ? (shadowClass || defaultShadow) : "shadow-none"}`}
        >
            {children}
        </div>
    );
};

export default StickyShadow;