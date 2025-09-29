import StatusBadge from './badges/StatusBadge';
import UrgencyBadge from './badges/UrgencyBadge';
import { Clock, Navigation, Phone } from 'lucide-react';

const CargoCard = ({ cargo, onAccept, onReject, showActions = false }) => {
  const distance = `${Math.floor(Math.random() * 15 + 5)}km`;
  const duration = `${Math.floor(Math.random() * 30 + 15)}분`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900">{cargo.id}</span>
            <UrgencyBadge urgency={cargo.urgency} />
          </div>
          <p className="text-sm text-gray-600">{cargo.type} • {cargo.weight}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-blue-600">{cargo.price}</p>
          <p className="text-xs text-gray-500">{distance} • {duration}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <p className="text-sm font-medium text-gray-900">{cargo.origin}</p>
        </div>
        <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-4"></div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <p className="text-sm font-medium text-gray-900">{cargo.destination}</p>
        </div>
      </div>
      
      {cargo.pickup_time && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>픽업: {cargo.pickup_time}</span>
        </div>
      )}
      
      {showActions && (
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={() => onReject(cargo.id)}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            거절
          </button>
          <button 
            onClick={() => onAccept(cargo.id)}
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