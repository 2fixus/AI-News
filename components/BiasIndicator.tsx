
import React from 'react';
import { PoliticalBias } from '../types';
import { RepublicanIcon, DemocraticIcon, NeutralIcon, InfoIcon } from './icons';

interface BiasIndicatorProps {
  bias: PoliticalBias;
}

const BiasIndicator: React.FC<BiasIndicatorProps> = ({ bias }) => {
  let bgColor = 'bg-gray-100'; // Default for unknown
  let textColor = 'text-gray-600';
  let borderColor = 'border-gray-300';
  let IconComponent = InfoIcon; // Default icon
  let text = 'Unknown';

  switch (bias) {
    case PoliticalBias.REPUBLICAN:
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      borderColor = 'border-red-400';
      IconComponent = RepublicanIcon;
      text = 'Leans Republican';
      break;
    case PoliticalBias.DEMOCRATIC:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-400';
      IconComponent = DemocraticIcon;
      text = 'Leans Democratic';
      break;
    case PoliticalBias.NEUTRAL:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-400';
      IconComponent = NeutralIcon;
      text = 'Neutral';
      break;
    case PoliticalBias.UNKNOWN:
      // Uses default values set above
      text = 'Bias Not Analyzed';
      break;
  }

  return (
    <div className={`flex items-center p-2 rounded-md border ${borderColor} ${bgColor} shadow-sm`}>
      <IconComponent className={`w-5 h-5 mr-2 ${textColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>{text}</span>
    </div>
  );
};

export default BiasIndicator;
