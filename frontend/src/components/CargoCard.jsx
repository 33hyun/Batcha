import React from 'react';
import UrgencyBadge from './badges/UrgencyBadge';
import { Clock } from 'lucide-react';

const CargoCard = ({ cargo, driverCapacity, onAccept, onReject, showActions = false }) => {
  const loadPercentage = driverCapacity ? (cargo.tons_total / driverCapacity) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900">#{cargo.id}</span>
            <UrgencyBadge urgency={cargo.urgency || 'normal'} />
          </div>
          <p className="text-sm text-gray-600">
            {cargo.commodity_name} • {cargo.tons_total}톤
          </p>

          {driverCapacity && (
            <div className="mt-1 text-sm text-gray-500">
              차량 적재: {cargo.tons_total} / {driverCapacity}톤
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="font-bold text-lg text-blue-600">
            ${cargo.expected_fare?.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{cargo.route_distance_km?.toFixed(1)}km</p>
        </div>
      </div>

      {cargo.deadline_str && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>예상 소요 시간: {cargo.deadline_str}</span>
        </div>
      )}

      {showActions && (
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={() => onReject && onReject(cargo.id)}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            거절
          </button>
          <button 
            onClick={() => onAccept && onAccept(cargo.id)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            수락
          </button>
        </div>
      )}
    </div>
  );
};

export default CargoCard;
