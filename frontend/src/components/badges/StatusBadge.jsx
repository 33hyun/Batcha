const StatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    available: { color: 'bg-green-100 text-green-800', text: '운행 가능' },
    busy: { color: 'bg-blue-100 text-blue-800', text: '운송 중' },
    rest: { color: 'bg-gray-100 text-gray-800', text: '휴식' },
    offline: { color: 'bg-red-100 text-red-800', text: '오프라인' }
  };
  
  const config = statusConfig[status] || statusConfig.offline;
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs';
  
  return (
    <span className={`${config.color} ${sizeClass} rounded-full font-medium`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;