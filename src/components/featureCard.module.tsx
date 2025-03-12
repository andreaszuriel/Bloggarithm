import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <div 
      className="relative bg-white rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
      onClick={onClick}
    >
      <div className="w-12 h-12 flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        {title}
      </h3>
      
      <p className="text-gray-700 text-sm leading-relaxed">
        {description}
      </p>
      
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-xl transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default FeatureCard;
