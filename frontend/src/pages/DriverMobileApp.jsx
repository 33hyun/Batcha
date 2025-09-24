import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, Star, Phone, Navigation, Package, 
  CheckCircle, AlertCircle, Play, Pause, Home, List, 
  User, Settings, Bell, Search, Filter, ChevronRight,
  DollarSign, Calendar, Route, Camera, MessageSquare
} from 'lucide-react';

import StatusBadge from '../components/badges/StatusBadge';
import UrgencyBadge from '../components/badges/UrgencyBadge';
import CargoCard from '../components/CargoCard';
import BottomNav from '../components/BottomNav';
import StatusToggle from '../components/StatusToggle';

// 메인 컴포넌트
const DriverMobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [driverStatus, setDriverStatus] = useState('available');
  const [currentDelivery, setCurrentDelivery] = useState(null);
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
    deliveries: 3,
    earnings: '540,000원',
    distance: '156km',
    hours: '8시간 30분'
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

  const handleCompleteDelivery = () => {
    setCurrentDelivery(null);
    setDriverStatus('available');
  };

  // 홈 탭 컨텐츠
  const HomeContent = () => (
    <div className="space-y-4">
      {/* 상태 토글 */}
      <StatusToggle status={driverStatus} onStatusChange={handleStatusChange} />
      
      {/* 현재 배송 */}
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
      
      {/* 오늘의 통계 */}
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

      {/* 사용 가능한 주문 */}
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

  // 주문 탭 컨텐츠
  const OrdersContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">주문 기록</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-medium text-green-800">CG003 완료</span>
              </div>
              <p className="text-sm text-green-600">부산 → 대구</p>
              <p className="text-xs text-gray-500">13:45 완료</p>
            </div>
            <p className="font-semibold text-green-600">320,000원</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-gray-600" />
                <span className="font-medium text-gray-800">CG002 완료</span>
              </div>
              <p className="text-sm text-gray-600">서울 → 인천</p>
              <p className="text-xs text-gray-500">10:30 완료</p>
            </div>
            <p className="font-semibold text-gray-600">180,000원</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 수익 탭 컨텐츠
  const EarningsContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">이번 주 수익</h3>
        
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-blue-600">2,340,000원</p>
          <p className="text-sm text-gray-600">총 15건 완료</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">월요일</span>
            <span className="font-medium">480,000원</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">화요일</span>
            <span className="font-medium">520,000원</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">오늘</span>
            <span className="font-medium text-blue-600">540,000원</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">정산 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">총 수익</span>
            <span>2,340,000원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">플랫폼 수수료 (8%)</span>
            <span className="text-red-600">-187,200원</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
            <span>실수령액</span>
            <span className="text-blue-600">2,152,800원</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 프로필 탭 컨텐츠
  const ProfileContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">김운송</h3>
            <p className="text-sm text-gray-600">기사 ID: DR001</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.8</span>
              <span className="text-sm text-gray-500">(156건)</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">156</p>
            <p className="text-sm text-gray-600">완료 배송</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">98%</p>
            <p className="text-sm text-gray-600">성공률</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">차량 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">차량 종류</span>
            <span>1톤 트럭</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">적재량</span>
            <span>1,000kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">차량 번호</span>
            <span>서울 12가 3456</span>
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
        
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
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
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Batcha 기사</h1>
            <div className="flex items-center space-x-2">
              <StatusBadge status={driverStatus} size="sm" />
              <span className="text-sm text-gray-600">김운송님</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="p-4">
        {renderContent()}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DriverMobileApp;