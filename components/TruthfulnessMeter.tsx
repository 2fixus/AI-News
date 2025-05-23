
import React from 'react';
import { TruthIcon } from './icons';

interface TruthfulnessMeterProps {
  score: number; // 0-100
}

const TruthfulnessMeter: React.FC<TruthfulnessMeterProps> = ({ score }) => {
  let barColor = 'bg-green-500';
  let textColor = 'text-green-700';
  let label = 'High Accuracy';

  if (score < 34) {
    barColor = 'bg-red-500';
    textColor = 'text-red-700';
    label = 'Low Accuracy';
  } else if (score < 67) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-700';
    label = 'Moderate Accuracy';
  }

  return (
    <div className="p-2 rounded-md border border-slate-300 bg-slate-50 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
           <TruthIcon className={`w-5 h-5 mr-2 ${textColor}`} />
           <span className={`text-sm font-medium ${textColor}`}>BS Meter:</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className={`text-xs mt-1 text-center ${textColor}`}>{label}</p>
    </div>
  );
};

export default TruthfulnessMeter;
    