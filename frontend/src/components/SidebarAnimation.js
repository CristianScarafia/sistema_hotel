import React, { useEffect, useState, Suspense } from 'react';

// Carga perezosa para no penalizar el primer render del sidebar
const Lottie = React.lazy(() => import('lottie-react'));

const SidebarAnimation = () => {
  const [animationData, setAnimationData] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/animations/hotel.json', { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('Animation not found');
        return res.json();
      })
      .then((json) => {
        if (isMounted) setAnimationData(json);
      })
      .catch(() => {
        if (isMounted) setHasError(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (hasError) return null;

  return (
    <div className="px-4 py-3 border-b border-white/10">
      {animationData ? (
        <Suspense
          fallback={<div className="h-28 w-full rounded-xl bg-white/5 animate-pulse" />}
        >
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 110, width: '100%' }}
          />
        </Suspense>
      ) : (
        <div className="h-28 w-full rounded-xl bg-white/5 animate-pulse" />
      )}
    </div>
  );
};

export default SidebarAnimation;


