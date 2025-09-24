export const [availableOrders, setAvailableOrders] = useState([
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