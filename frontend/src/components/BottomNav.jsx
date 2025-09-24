import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, Star, Phone, Navigation, Package, 
  CheckCircle, AlertCircle, Play, Pause, Home, List, 
  User, Settings, Bell, Search, Filter, ChevronRight,
  DollarSign, Calendar, Route, Camera, MessageSquare
} from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'orders', icon: List, label: '주문' },
    { id: 'earnings', icon: DollarSign, label: '수익' },
    { id: 'profile', icon: User, label: '프로필' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={24} />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default BottomNav;