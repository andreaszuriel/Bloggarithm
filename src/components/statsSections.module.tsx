import { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

export default function StatsSection() {
  const [startAnimation, setStartAnimation] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      setStartAnimation(true);
    }
  }, [inView]);

  const stats = [
    { number: 23500, label: 'Articles Generated' },
    { number: 98, label: 'Accuracy Rate', suffix: '%' },
    { number: 4500, label: 'Active Writers' },
    { number: 12, label: 'Algorithms', suffix: 'k+' }
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-background animate-on-scroll">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="text-center p-6 rounded-xl bg-glass-effect backdrop-blur-sm border border-secondary/10"
          >
            <div className="text-4xl font-bold mb-2 gradient-text">
              {startAnimation && (
                <CountUp
                  start={0}
                  end={stat.number}
                  duration={2.5}
                  suffix={stat.suffix || ''}
                />
              )}
            </div>
            <p className="text-text/80 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}