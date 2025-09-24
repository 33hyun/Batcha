const UrgencyBadge = ({ urgency }) => {
  const urgencyConfig = {
    normal: { color: 'bg-gray-100 text-gray-800', text: '일반' },
    urgent: { color: 'bg-orange-100 text-orange-800', text: '긴급' },
    express: { color: 'bg-red-100 text-red-800', text: '당일배송' }
  };
  
  const config = urgencyConfig[urgency] || urgencyConfig.normal;
  
  return (
    <span className={`${config.color} px-2 py-1 rounded-full text-xs font-medium`}>
      {config.text}
    </span>
  );
};

export default UrgencyBadge;