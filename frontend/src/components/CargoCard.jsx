import StatusBadge from './badges/StatusBadge';
import UrgencyBadge from './badges/UrgencyBadge';
import { Clock, Navigation, Phone } from 'lucide-react';

const CargoCard = ({ cargo, onAccept, onReject, showActions = false }) => {
  const distance = `${Math.floor(Math.random() * 15 + 5)}km`;
  const duration = `${Math.floor(Math.random() * 30 + 15)}분`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* ... 기존 카드 내용 동일 ... */}
    </div>
  );
};

export default CargoCard;