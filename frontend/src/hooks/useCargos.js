import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

export const useCargos = (userId, driverCapacityTons) => {
  const [availableCargos, setAvailableCargos] = useState([]);
  const [myCargos, setMyCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 사용 가능한 화물 조회 (적재량 필터링)
  const fetchAvailableCargos = async () => {
    try {
      let query = supabase
        .from('cargos')
        .select('*')
        .eq('status', 'available');

      // 기사의 적재량보다 작거나 같은 화물만 조회
      if (driverCapacityTons) {
        query = query.lte('weight_tons', driverCapacityTons);
      }

      const { data, error } = await query.order('pickup_time', { ascending: true });

      if (error) throw error;
      
      // 데이터 포맷 변경
      const formatted = data.map(cargo => ({
        id: cargo.cargo_number,
        type: cargo.type,
        weight: cargo.weight,
        origin: cargo.origin,
        destination: cargo.destination,
        urgency: cargo.urgency,
        price: cargo.price.toLocaleString() + '원',
        pickup_time: new Date(cargo.pickup_time).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        raw: cargo // 원본 데이터 보관
      }));

      setAvailableCargos(formatted);
    } catch (error) {
      console.error('화물 조회 실패:', error);
    }
  };

  // 내 배정된 화물 조회
  const fetchMyCargos = async () => {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .eq('driver_id', userId)
        .in('status', ['assigned', 'in_transit'])
        .order('pickup_time', { ascending: true });

      if (error) throw error;

      const formatted = data.map(cargo => ({
        id: cargo.cargo_number,
        type: cargo.type,
        weight: cargo.weight,
        origin: cargo.origin,
        destination: cargo.destination,
        urgency: cargo.urgency,
        price: cargo.price.toLocaleString() + '원',
        pickup_time: new Date(cargo.pickup_time).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        raw: cargo
      }));

      setMyCargos(formatted);
    } catch (error) {
      console.error('내 화물 조회 실패:', error);
    }
  };

  // 화물 수락
  const acceptCargo = async (cargoNumber) => {
    try {
      const { error } = await supabase
        .from('cargos')
        .update({ 
          driver_id: userId, 
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('cargo_number', cargoNumber);

      if (error) throw error;

      // 목록 새로고침
      await fetchAvailableCargos();
      await fetchMyCargos();
      
      return true;
    } catch (error) {
      console.error('화물 수락 실패:', error);
      return false;
    }
  };

  // 배송 시작
  const startDelivery = async (cargoNumber) => {
    try {
      const { error } = await supabase
        .from('cargos')
        .update({ 
          status: 'in_transit',
          updated_at: new Date().toISOString()
        })
        .eq('cargo_number', cargoNumber);

      if (error) throw error;

      await fetchMyCargos();
      return true;
    } catch (error) {
      console.error('배송 시작 실패:', error);
      return false;
    }
  };

  // 배송 완료
  const completeCargo = async (cargoNumber) => {
    try {
      const { error } = await supabase
        .from('cargos')
        .update({ 
          status: 'completed',
          delivery_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('cargo_number', cargoNumber);

      if (error) throw error;

      // 기사 프로필의 배송 건수 증가
      const { error: profileError } = await supabase.rpc('increment_deliveries', {
        user_id_input: userId
      });

      if (profileError) {
        // RPC 함수가 없으면 직접 업데이트
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('total_deliveries')
          .eq('user_id', userId)
          .single();

        await supabase
          .from('driver_profiles')
          .update({ total_deliveries: (profile?.total_deliveries || 0) + 1 })
          .eq('user_id', userId);
      }

      await fetchMyCargos();
      return true;
    } catch (error) {
      console.error('배송 완료 실패:', error);
      return false;
    }
  };

  // 실시간 구독
  useEffect(() => {
    setLoading(true);
    fetchAvailableCargos();
    fetchMyCargos();
    setLoading(false);

    // 실시간 변경 감지
    const subscription = supabase
      .channel('cargos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cargos' }, 
        () => {
          fetchAvailableCargos();
          fetchMyCargos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    availableCargos,
    myCargos,
    loading,
    acceptCargo,
    startDelivery,
    completeCargo,
    refresh: () => {
      fetchAvailableCargos();
      fetchMyCargos();
    }
  };
};