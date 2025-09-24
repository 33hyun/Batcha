const StatusToggle = ({ status, onStatusChange }) => {
  const isOnline = status === 'available' || status === 'busy';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">운행 상태</h3>
          <p className="text-sm text-gray-600">
            {isOnline ? '온라인 상태입니다' : '오프라인 상태입니다'}
          </p>
        </div>
        <button
          onClick={() => onStatusChange(isOnline ? 'offline' : 'available')}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isOnline ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isOnline ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
export default StatusToggle;