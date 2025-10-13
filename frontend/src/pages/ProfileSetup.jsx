import { useState } from 'react';
import { supabase } from '../supabase/supabase';
import { User, Truck, Package, Phone } from 'lucide-react';

export default function ProfileSetup({ userId, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle_type: '1톤 트럭',
    vehicle_capacity: '',
    vehicle_number: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.vehicle_number || !formData.vehicle_capacity) {
      alert('모든 필수 항목을 입력해주세요');
      return;
    }

    setLoading(true);

    try {
      // 적재량에서 숫자 추출 (예: "2.5톤" -> 2.5, "3톤" -> 3)
      const capacityMatch = formData.vehicle_capacity.match(/[\d.]+/);
      const capacityTons = capacityMatch ? parseFloat(capacityMatch[0]) : null;

      if (!capacityTons) {
        alert('적재량을 올바르게 입력해주세요 (예: 2.5톤, 3톤)');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('driver_profiles')
        .insert([
          {
            user_id: userId,
            name: formData.name,
            phone: formData.phone,
            vehicle_type: formData.vehicle_type,
            vehicle_capacity: formData.vehicle_capacity,
            capacity_tons: capacityTons,
            vehicle_number: formData.vehicle_number
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('프로필 생성 완료:', data);
      onComplete(data);
    } catch (error) {
      console.error('프로필 생성 실패:', error);
      alert('프로필 생성에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">프로필 설정</h2>
          <p className="text-gray-600 mt-2">기사 정보를 입력해주세요</p>
        </div>

        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="홍길동"
              required
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호 *
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="010-1234-5678"
                required
              />
            </div>
          </div>

          {/* 차량 종류 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              차량 종류 *
            </label>
            <div className="relative">
              <Truck size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="카고">카고</option>
                <option value="탑차">탑차</option>
                <option value="트레일러">트레일러</option>
                <option value="냉동탑차">냉동탑차</option>
                <option value="탱크로리">탱크로리</option>
              </select>
            </div>
          </div>

          {/* 적재량 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              적재량 *
            </label>
            <div className="relative">
              <Package size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                name="vehicle_capacity"
                value={formData.vehicle_capacity}
                onChange={(e) => {
                  let value = e.target.value;

                  // 숫자와 소수점만 허용
                  value = value.replace(/[^0-9.]/g, '');

                  // 빈 값이 아니면 '톤' 붙이기
                  if (value) {
                    value = value + '톤';
                  }

                  handleChange({
                    target: {
                      name: 'vehicle_capacity',
                      value,
                    },
                  });
                }}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="숫자만 입력하세요 예: 25톤 = 25"
                required
              />
            </div>
          </div>

          {/* 차량 번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              차량 번호 *
            </label>
            <input
              type="text"
              name="vehicle_number"
              value={formData.vehicle_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="서울 12가 3456"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? '저장 중...' : '프로필 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}