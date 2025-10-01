import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, Star, Phone, Navigation, Package, 
  CheckCircle, AlertCircle, Play, Pause, Home, List, 
  User, Settings, Bell, Search, Filter, ChevronRight,
  DollarSign, Calendar, Route, Camera, MessageSquare
} from 'lucide-react';
import { supabase } from '../supabase/supabase';

import StatusBadge from '../components/badges/StatusBadge';
import UrgencyBadge from '../components/badges/UrgencyBadge';
import CargoCard from '../components/CargoCard';
import BottomNav from '../components/BottomNav';
import StatusToggle from '../components/StatusToggle';

const DriverMobileApp = ({ user, profile: initialProfile }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [driverStatus, setDriverStatus] = useState('available');
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [profile, setProfile] = useState(initialProfile);
  const [availableOrders, setAvailableOrders] = useState([
    {
      id: 'CG001',
      type: '일반화물',
      weight: '2.5톤',
      origin: '서울 강남구 테헤란로',
      destination: '인천 연수구 송도동',
      urgency: 'normal',
      price: '180,000원',
      pickup_time: '14:30'
    },
    {
      id: 'CG002',
      type: '냉장화물',
      weight: '1.8톤',
      origin: '경기 성남시 분당구',
      destination: '서울 서초구 방배동',
      urgency: 'urgent',
      price: '220,000원',
      pickup_time: '15:00'
    }
  ]);

  const [todayStats] = useState({
    deliveries: profile?.total_deliveries || 0,
    earnings: '0원',
    distance: '0km',
    hours: '0시간'
  });

  const handleStatusChange = (newStatus) => {
    setDriverStatus(newStatus);
  };

  const handleAcceptOrder = (orderId) => {
    const order = availableOrders.find(o => o.id === orderId);
    setCurrentDelivery(order);
    setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
    setDriverStatus('busy');
  };

  const handleRejectOrder = (orderId) => {
    setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleCompleteDelivery = async () => {
    // 배송 완료 시 총 배송 건수 업데이트
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ 
          total_deliveries: (profile.total_deliveries || 0) + 1 
        })
        .eq('user_id', user.id);

      if (!error) {
        setProfile(prev => ({
          ...prev,
          total_deliveries: (prev.total_deliveries || 0) + 1
        }));
      }
    } catch (error) {
      console.error('배송 완료 업데이트 실패:', error);
    }

    setCurrentDelivery(null);
    setDriverStatus('available');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // 홈 탭 컨텐츠
  const HomeContent = () => (
    <div className="space-y-4">
      <StatusToggle status={driverStatus} onStatusChange={handleStatusChange} />
      
      {currentDelivery && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">현재 배송</h3>
            <StatusBadge status="busy" />
          </div>
          
          <CargoCard cargo={currentDelivery} />
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg">
              <Navigation size={20} />
              <span>길찾기</span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg">
              <Phone size={20} />
              <span>연락하기</span>
            </button>
          </div>
          
          <button 
            onClick={handleCompleteDelivery}
            className="w-full mt-2 py-3 bg-gray-900 text-white rounded-lg font-medium"
          >
            배송 완료
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">오늘의 성과</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{todayStats.deliveries}</p>
            <p className="text-sm text-gray-600">완료 배송</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{todayStats.earnings}</p>
            <p className="text-sm text-gray-600">수익</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">{todayStats.distance}</p>
            <p className="text-sm text-gray-600">주행거리</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-orange-600">{todayStats.hours}</p>
            <p className="text-sm text-gray-600">운행시간</p>
          </div>
        </div>
      </div>

      {driverStatus === 'available' && availableOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">사용 가능한 주문</h3>
            <span className="text-sm text-blue-600">{availableOrders.length}건</span>
          </div>
          
          {availableOrders.map((cargo) => (
            <CargoCard
              key={cargo.id}
              cargo={cargo}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">주문 기록</h3>
        
        <div className="space-y-3">
          {profile.total_deliveries === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 완료된 배송이 없습니다
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-green-800">완료된 배송</span>
                </div>
                <p className="text-sm text-green-600">총 {profile.total_deliveries}건</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const EarningsContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">이번 주 수익</h3>
        
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-blue-600">0원</p>
          <p className="text-sm text-gray-600">총 {profile.total_deliveries}건 완료</p>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          배송을 완료하면 수익이 표시됩니다
        </div>
      </div>
    </div>
  );

  const ProfileContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-600">{profile.phone}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{profile.rating || '0.0'}</span>
              <span className="text-sm text-gray-500">({profile.total_deliveries}건)</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">{profile.total_deliveries}</p>
            <p className="text-sm text-gray-600">완료 배송</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">100%</p>
            <p className="text-sm text-gray-600">성공률</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">차량 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">차량 종류</span>
            <span>{profile.vehicle_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">적재량</span>
            <span>{profile.vehicle_capacity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">차량 번호</span>
            <span>{profile.vehicle_number}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-gray-900">설정</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-gray-900">고객센터</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <span className="text-red-600">로그아웃</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeContent />;
      case 'orders': return <OrdersContent />;
      case 'earnings': return <EarningsContent />;
      case 'profile': return <ProfileContent />;
      default: return <HomeContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Batcha 기사</h1>
            <div className="flex items-center space-x-2">
              <StatusBadge status={driverStatus} size="sm" />
              <span className="text-sm text-gray-600">{profile.name}님</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DriverMobileApp;