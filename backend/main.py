# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from geopy.distance import geodesic

app = FastAPI()

# CORS 설정 (React localhost 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# 1. 파일 경로
# ==============================
file_path = r"C:\Users\enjoy\Study\project\teamproject\FAF5.5.1_HiLoForecasts.csv"
metadata_path = r"C:\Users\enjoy\Study\project\teamproject\FAF5_metadata.xlsx"

# ==============================
# 2. 메타데이터 읽기
# ==============================
df_state = pd.read_excel(metadata_path, sheet_name="State")
state_map = df_state.set_index("Numeric Label")["Description"].to_dict()

df_zone = pd.read_excel(metadata_path, sheet_name="FAF Zone (Domestic)")
zone_map = df_zone.set_index("Numeric Label")["Short Description"].to_dict()

df_commodity = pd.read_excel(metadata_path, sheet_name="Commodity (SCTG2)")
commodity_map = df_commodity.set_index("Numeric Label")["Description"].to_dict()

# ==============================
# 3. CSV 읽기 및 필터링
# ==============================
use_cols = [
    "dms_orig", "dms_dest", "dms_mode", "sctg2", "trade_type",
    "tons_2020", "tons_2021", "tons_2022", "tons_2023",
    "value_2020", "value_2021", "value_2022", "value_2023"
]

chunksize = 1_000_000
filtered_chunks = []

for chunk in pd.read_csv(file_path, usecols=use_cols, chunksize=chunksize):
    chunk_filtered = chunk[(chunk["dms_mode"] == 1) & (chunk["trade_type"] == 1)].copy()
    
    for year in range(2020, 2024):
        chunk_filtered[f"avg_price_per_ton_{year}"] = chunk_filtered[f"value_{year}"] / chunk_filtered[f"tons_{year}"]
    
    chunk_filtered["tons_total"] = chunk_filtered[["tons_2020","tons_2021","tons_2022","tons_2023"]].sum(axis=1)
    chunk_filtered["value_total"] = chunk_filtered[["value_2020","value_2021","value_2022","value_2023"]].sum(axis=1)
    chunk_filtered["avg_price_per_ton_mean"] = chunk_filtered[[ 
        "avg_price_per_ton_2020","avg_price_per_ton_2021","avg_price_per_ton_2022","avg_price_per_ton_2023"
    ]].mean(axis=1)
    
    # 변경된 로직: 성장률 계산
    chunk_filtered["tons_growth"] = (chunk_filtered["tons_2023"] - chunk_filtered["tons_2020"]) / chunk_filtered["tons_2020"]
    chunk_filtered["value_growth"] = (chunk_filtered["value_2023"] - chunk_filtered["value_2020"]) / chunk_filtered["value_2020"]
    
    filtered_chunks.append(chunk_filtered)

df = pd.concat(filtered_chunks, ignore_index=True)
df["dms_orig_name"] = df["dms_orig"].map(zone_map)
df["dms_dest_name"] = df["dms_dest"].map(zone_map)
df["commodity_name"] = df["sctg2"].map(commodity_map)

# ==============================
# 4. 샘플 기사 매칭용 기본 정보
# ==============================
driver_locations = {
    "뉴욕": (40.7128, -74.0060),
    "시카고": (41.8781, -87.6298),
    "LA": (34.0522, -118.2437),
    "텍사스": (31.9686, -99.9018),
    "덴버": (39.7392, -104.9903)
}

vehicle_types = ["소형", "중형", "대형"]
vehicle_load_ranges = {"소형": (3,5), "중형": (5,10), "대형": (10,15)}
fuel_price_per_gallon = 4.0
vehicle_mpg = {"소형": 20, "중형": 12, "대형": 6}
km_per_mile = 1.60934
avg_price_per_ton_usd = {"소형": 100, "중형": 150, "대형": 200}

# ==============================
# 5. 운송비용 계산 함수
# ==============================
def calc_transport_cost(row, driver_location):
    distance_mile = geodesic(driver_location, (row["orig_lat"], row["orig_lon"])).miles
    gallons = distance_mile / vehicle_mpg[row["vehicle_type"]]
    return gallons * fuel_price_per_gallon

# ==============================
# 6. API: 사용 가능한 주문 가져오기 (test_250929 기준)
# ==============================
@app.get("/api/available-orders")
def get_available_orders(sample_size: int = 10):
    np.random.seed(42)
    df_sample = df.sample(min(sample_size, len(df)), random_state=42).copy()
    
    # 차량/톤수/기사 ID 랜덤 배정
    df_sample["vehicle_type"] = np.random.choice(vehicle_types, size=len(df_sample))
    df_sample["tons_total"] = df_sample["vehicle_type"].apply(lambda x: np.round(np.random.uniform(*vehicle_load_ranges[x]),1))
    n_drivers = 1000
    df_sample["driver_id"] = np.random.randint(1, n_drivers+1, size=len(df_sample))
    
    # 랜덤 좌표 생성 (CSV에 좌표 없으므로)
    df_sample["orig_lat"] = np.random.uniform(30,50, size=len(df_sample))
    df_sample["orig_lon"] = np.random.uniform(-120,-70, size=len(df_sample))
    df_sample["dest_lat"] = np.random.uniform(30,50, size=len(df_sample))
    df_sample["dest_lon"] = np.random.uniform(-120,-70, size=len(df_sample))
    
    # 기사별 가까운 주문 20개 별표시
    df_sample["is_starred"] = False
    for name, loc in driver_locations.items():
        df_sample[f"distance_to_{name}"] = df_sample.apply(lambda row: geodesic(loc, (row["orig_lat"], row["orig_lon"])).km, axis=1)
        closest_idx = df_sample.nsmallest(20, f"distance_to_{name}").index
        df_sample.loc[closest_idx, "is_starred"] = True
    
    # 순수익 계산
    df_sample["expected_profit"] = df_sample.apply(lambda row: row["tons_total"] * avg_price_per_ton_usd[row["vehicle_type"]], axis=1)
    df_sample["transport_cost"] = df_sample.apply(lambda row: calc_transport_cost(row, driver_locations["뉴욕"]), axis=1)
    df_sample["actual_profit"] = df_sample["expected_profit"] - df_sample["transport_cost"]
    
    # 출발지 → 도착지 총거리
    df_sample["route_distance_km"] = df_sample.apply(
        lambda row: geodesic((row["orig_lat"], row["orig_lon"]), (row["dest_lat"], row["dest_lon"])).km,
        axis=1
    )
    
    df_matches = df_sample[df_sample["actual_profit"] > 0].copy()
    
    orders = df_matches.head(sample_size)[[
        "dms_orig_name","dms_dest_name","commodity_name","vehicle_type",
        "tons_total","expected_profit","transport_cost","actual_profit","route_distance_km","is_starred"
    ]].to_dict(orient="records")
    
    return orders
