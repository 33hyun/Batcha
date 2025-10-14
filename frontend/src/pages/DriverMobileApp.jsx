// DriverMobileApp.jsx
import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, Star, Phone, Navigation, Package, 
  CheckCircle, Play, Pause, User, Settings, Bell, ChevronRight,
  DollarSign, Home, List
} from 'lucide-react';
import {supabase} from "../supabase/supabase";

import StatusBadge from '../components/badges/StatusBadge';
import CargoCard from '../components/CargoCard';
import BottomNav from '../components/BottomNav';
import StatusToggle from '../components/StatusToggle';

const DriverMobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [driverStatus, setDriverStatus] = useState('available');
  const [profile, setProfile] = useState(null);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [availableCargos, setAvailableCargos] = useState([]);
  const [myCargos, setMyCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    // profile이 로드되면 화물 목록 불러오기
    if (profile) {
      loadAvailableCargos();
    }
  }, [profile]);

 const checkUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    setUser(user);
    const profileData = await loadDriverProfile(user.id); 
    if (profileData) {
      await loadAvailableCargos(user.id, profileData); 
      await loadMyCargos(user.id);
    }
  }
  setLoading(false);
};

  const loadDriverProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  const loadAvailableCargos = async (userId) => {
  if (!profile) return;
  try {
    const { data, error } = await supabase
      .from('cargo_data')
      .select('*')
      .is('driver_id', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // 조건부 렌더링
    const minTons = Math.max(5, profile.capacity_tons - 5); // 최소 기준
    const maxTons = profile.capacity_tons; // 최대 기준

    const filtered = data.filter(cargo =>
      cargo.tons_total >= minTons && cargo.tons_total <= maxTons
    );

    setAvailableCargos(filtered || []);
  } catch (error) {
    console.error('화물 목록 로드 실패:', error);
  }
};


  const loadMyCargos = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cargo_data')
        .select('*')
        .eq('driver_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyCargos(data || []);
    } catch (error) {
      console.error('내 화물 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (cargoId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cargo_data')
        .update({ driver_id: user.id, status: 'matched' })
        .eq('id', cargoId);

      if (error) throw error;

      const acceptedCargo = availableCargos.find(c => c.id === cargoId);
      setCurrentDelivery(acceptedCargo);
      setAvailableCargos(prev => prev.filter(c => c.id !== cargoId));
      setMyCargos(prev => [...prev, { ...acceptedCargo, driver_id: user.id }]);
      setDriverStatus('busy');
      alert('화물 수락 완료!');
    } catch (error) {
      console.error('화물 수락 실패:', error);
      alert('화물 수락 중 오류가 발생했습니다.');
    }
  };

  const handleRejectOrder = (cargoId) => {
    setAvailableCargos(prev => prev.filter(c => c.id !== cargoId));
  };

  const handleCompleteDelivery = async () => {
    if (!currentDelivery || !user) return;
    try {
      const { error: cargoError } = await supabase
        .from('cargo_data')
        .update({ status: 'completed' })
        .eq('id', currentDelivery.id);

      if (cargoError) throw cargoError;

      const { error: profileError } = await supabase
        .from('driver_profiles')
        .update({ total_deliveries: (profile.total_deliveries || 0) + 1 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setProfile(prev => ({
        ...prev,
        total_deliveries: (prev.total_deliveries || 0) + 1
      }));
      setCurrentDelivery(null);
      setDriverStatus('available');
      loadMyCargos(user.id);
      alert('배송 완료!');
    } catch (error) {
      console.error('배송 완료 처리 실패:', error);
      alert('배송 완료 처리 중 오류가 발생했습니다.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    setDriverStatus(newStatus);
    if (user) {
      try {
        await supabase
          .from('driver_profiles')
          .update({ status: newStatus })
          .eq('id', user.id);
      } catch (error) {
        console.error('상태 업데이트 실패:', error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const renderContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'home':
        return (
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

            {/* 사용 가능한 주문 */}
            {driverStatus === 'available' && availableCargos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">사용 가능한 주문</h3>
                  <span className="text-sm text-blue-600">{availableCargos.length}건</span>
                </div>
                {availableCargos.map((cargo) => (
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
      case 'orders':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">나의 배송</h3>
              {myCargos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  진행 중이거나 완료된 배송이 없습니다
                </div>
              ) : (
                myCargos.map((cargo) => <CargoCard key={cargo.id} cargo={cargo} />)
              )}
            </div>
          </div>
        );
      case 'earnings':
  const totalEarnings = myCargos.reduce((sum, c) => sum + (c.expected_fare || 0), 0);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">총 수익</h3>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-blue-600">${totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600">총 {myCargos.length}건 완료</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">정산 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
            <span>총 수익</span>
            <span className="text-blue-600">${totalEarnings.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

      case 'profile':
        return (
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
                    <span className="text-sm text-gray-500">({profile.total_deliveries || 0}건)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">{profile.total_deliveries || 0}</p>
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
                  <span>{profile.vehicle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">적재량</span>
                  <span>{profile.capacity_tons}톤</span>
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
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">기사용 앱을 사용하려면 로그인해주세요.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Batcha 기사</h1>
            <div className="flex items-center space-x-2">
              <StatusBadge status={driverStatus} size="sm" />
              <span className="text-sm text-gray-600">{profile?.name}님</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4">{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DriverMobileApp;