import React from 'react';

interface ShimmerTextProps {
  text?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  gradientColors?: string;
  animationDuration?: string;
}

const ShimmerText: React.FC<ShimmerTextProps> = ({
  text,
  className,
  as: Component = 'h1',
  gradientColors = 'from-purple-400 via-pink-500 to-purple-400',
  animationDuration = '2s'
}) => {
  return (
    <div className="relative overflow-hidden">
      <Component className={`bg-clip-text text-transparent bg-gradient-to-r ${gradientColors} animate-shimmer ${className || ''}`}>
        {text || 'Shimmer Text Effect'}
      </Component>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: 0% center;
          }
        }
        .animate-shimmer {
          animation: shimmer ${animationDuration} ease-in-out infinite;
          background-size: 200% auto;
        }
      `}</style>
    </div>
  );
};

export default ShimmerText;