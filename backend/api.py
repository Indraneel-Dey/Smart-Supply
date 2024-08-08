from typing import Dict, List, Tuple

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from geopy import distance

last_updated = '20 March, 2024'

from module import Module

app = FastAPI()
mod = Module()

# Add this code to allow any cross origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class KPI(BaseModel):
    title: str
    metric: int


class Warehouse(BaseModel):
    name: str
    type: str
    latitude: float
    longitude: float


class RTWarehouse(BaseModel):
    name: str
    stat: str
    status: str


class RestockTable(BaseModel):
    num_plants: int
    warehouse: List[RTWarehouse]


class DataResponse(BaseModel):
    addressPoints: List[Tuple[float, float]]
    warehouses: List[Warehouse]
    kpi: List[KPI]
    res_table: List[RestockTable]
    last_update: str


@app.get("/api")
async def root():
    addressPoints = mod.get_disease_locations()
    warehouses = mod.get_warehouses()
    kpi = [{"title": "Active Disease", "metric": mod.num_active_disease()}]
    res_table = [
        {"num_plants": mod.num_plants_restock(), "warehouse": mod.ps_warehouse()}
    ]
    return DataResponse(
        addressPoints=addressPoints, kpi=kpi, warehouses=warehouses, res_table=res_table, last_update=last_updated
    )


@app.get("/api/details")
async def details():
    return mod.get_details()


@app.get("/api/disease-details")
async def disease_details(plant: str = None, disease: str = None):
    return mod.get_disease_map(plant=plant, disease=disease)


@app.post("/api/distance")
async def get_distance(data: dict) -> list:
    distances = []
    current = data["current"]
    for plant in data["plants"]:
        temp = {"name": plant["name"], "distance": round(distance.distance(current, [plant["latitude"], plant["longitude"]]).km, 2)}
        distances.append(temp)
    return distances


if __name__ == "__main__":
    uvicorn.run("api:app", reload=True)
