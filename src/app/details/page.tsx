"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HomeIcon, XCircleIcon } from "@heroicons/react/24/solid";

import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  Button,
  TableBody,
  Badge,
  SearchSelect,
  SearchSelectItem,
  Metric
} from "@tremor/react";

interface Detail {
  disease: string;
  signal: number;
  product: string;
  current_inventory: number;
  old_inventory: number;
  restock: number;
  name: string;
  material: string;
}

interface DiseaseBrandMapping {
  disease: string;
  product: string[];
}

interface KPI {
  title: string;
  metric: number;
}

interface RestockTable {
  num_plants: number;
  warehouse: {
    name: string;
    stat: string;
    status: string;
  }[];
}

interface DataType {
  addressPoints: [number, number][];
  warehouses: {
    place_id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
  }[];
  kpi: KPI[];
  res_table: RestockTable[];
  last_update: string;
}

interface Distances {
  name: string;
  distance: number;
}

export default function Home() {
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [Data, setData] = useState<DataType>({
    addressPoints: [],
    kpi: [],
    warehouses: [],
    res_table: [],
    last_update: ""
  });
  const [details, setDetails] = useState<Detail[]>([]);
  const [disBrandMapping, setDisBrandMapping] = useState<DiseaseBrandMapping[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<Detail[]>([]);
  const [available, setAvailable] = useState<Detail[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [distances, setDistances] = useState<Distances[]>([]);
  const [current, setCurrent] = useState("");
  const [modalData, setModalData] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDis, setIsOpenDis] = useState(false);
  const [isOpenStock, setIsOpenStock] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const openModalDis = () => setIsOpenDis(true);
  const closeModalDis = () => setIsOpenDis(false);
  const closeModalStock = () => {
    setIsOpenStock(false);
  }
  const openModalStock = async (brand: string, material:string, name: string) => {
    const nonZeroInventory = filteredDetails.filter((item) => item.product === brand && item.material === material && item.restock !== 1);
    const plantNames = nonZeroInventory.map(item => item.name);
    const plantsWithInventory = Data["warehouses"].filter(plant => plantNames.includes(plant.name));
    const currentPlant = Data["warehouses"].filter(plant => plant.name === name)[0];
    setCurrent(name);
    setProduct(brand);
    setAvailable(nonZeroInventory);
    setPlants(plantsWithInventory);
    const data = {
      "current": [currentPlant.latitude, currentPlant.longitude],
      "plants": plantsWithInventory
    }
    await fetch(// `http://localhost:8000/api/distance`, 
    `api/distance`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      setDistances(data);
    })
  };

  useEffect(() => {
    const mergedData = plants.map((plant) => {
      const inventoryItem = available.find(item => item.name === plant.name);
      const distanceItem = distances.find((item: { name: string; }) => item.name === plant.name)
      if (inventoryItem && distanceItem) {
        return {
          ...plant,
          current_inventory: inventoryItem.current_inventory,
          distance: distanceItem.distance
        };
      }
      return plant;
    });
    setModalData(mergedData);
    if (current && product) {
      setIsOpenStock(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distances])
  
  const handleButtonClick = () => {
    setFilters((prevState) => ({
      ...prevState,
      remove_not_available: !prevState.remove_not_available,
    }));
  };

  const [filters, setFilters] = useState({
    plant: "",
    disease: "",
    material: "",
    restock_status: "",
    remove_not_available: true,
  });

  const uniquePlants = [
    "All Plants",
    ...Array.from(new Set(details.map((item) => item.name))),
  ];

  const uniqueDiseases = [
    "All Diseases",
    ...Array.from(new Set(details.map((item) => item.disease))),
  ];

  const uniqueMaterials = [
    "All Materials",
    ...Array.from(new Set(details.map((item) => item.material))),
  ];

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`api`);
      // const response = await fetch(`http://localhost:8000/api`);
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDetails() {
      const response = await fetch(`api/details`);
      // const response = await fetch(`http://localhost:8000/api/details`);
      const data = await response.json();
      setDetails(data.details_table);
      setDisBrandMapping(data.dis_brand_mapping);
      setFilteredDetails(data.details_table);
    }

    fetchDetails();
  }, []);

  useEffect(() => {
    let newFilteredDetails = [...details];

    if (filters.plant) {
      newFilteredDetails = newFilteredDetails.filter(
        (item) => item.name === filters.plant
      );
    }

    if (filters.disease) {
      newFilteredDetails = newFilteredDetails.filter(
        (item) => item.disease === filters.disease
      );
    }

    if (filters.material) {
      newFilteredDetails = newFilteredDetails.filter(
        (item) => item.material === filters.material
      );
    }

    if (filters.restock_status) {
      newFilteredDetails = newFilteredDetails.filter(
        (item) => item.restock === parseInt(filters.restock_status)
      );
    }

    if (filters.remove_not_available) {
      newFilteredDetails = newFilteredDetails.filter(
        (item) => item.material !== "SKU Not Available"
      );
    }

    setFilteredDetails(newFilteredDetails);
  }, [details, filters]);

  const handlePlantChange = (value: string) => {
    setFilters((prevState) => ({
      ...prevState,
      plant: value === "All Plants" ? "" : value,
    }));
  };

  const handleDiseaseChange = (value: string) => {
    setFilters((prevState) => ({
      ...prevState,
      disease: value === "All Diseases" ? "" : value,
    }));
  };

  const handleMaterialChange = (value: string) => {
    setFilters((prevState) => ({
      ...prevState,
      material: value === "All Materials" ? "" : value,
    }));
  };

  const handleRestockStatusChange = (value: string) => {
    setFilters((prevState) => ({
      ...prevState,
      restock_status: value === "All" ? "" : value,
    }));
  };

  const WarehouseTable = () => {
    return (
      <Table>
        <TableHead>
            <TableRow>
              <TableHeaderCell>Plant</TableHeaderCell>
              <TableHeaderCell>Inventory</TableHeaderCell>
              <TableHeaderCell>Distance (km)</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modalData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.current_inventory}</TableCell>
                <TableCell>{item.distance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
      </Table>
    )
  }

  const Modal = () => {
    return (
      <div className={`modal flex items-center justify-center ${isOpenStock ? "" : "hidden"}`}>
        <div className="rounded-lg p-6">
          <div className="mb-4 flex justify-center" style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 className="text-lg font-bold">Where {product} is available</h2>
            <Button
              className="absolute top-0 right-0 m-4 bg-transparent hover:bg-transparent focus:outline-none focus:ring-0"
              onClick={closeModalStock}
              aria-label="Close"
              style={{ borderWidth: 0 }}
            >
              <XCircleIcon className="h-6 w-6 text-gray-900 hover:text-red-500" aria-hidden="true" />
            </Button>
          </div>
          Current plant: {current}
          <div>
            <WarehouseTable />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="h-full">
      <div className={`overlay ${isOpenStock || isOpen || isOpenDis ? "" : "hidden"}`}></div>
      <div className="flex justify-between h-10">
        <div className="">
          <Button
            size="xs"
            variant="light"
            icon={HomeIcon}
            iconPosition="left"
            className="mt-2"
            onClick={() => router.push("/")}
          >
            Home
          </Button>
          <Metric>Inventory Details</Metric>
        </div>
        <div className="flex justify-between">
          <div className="flex">
            <div>
              <Button onClick={openModal} size="xs">
                Help
              </Button>
              <div className={`modal flex items-center justify-center ${isOpen ? "" : "hidden"}`}>
                <div className="rounded-lg p-6">
                  <div className="mb-4 flex justify-center" style={{ display: "flex", justifyContent: "space-between" }}>
                    <h2 className="text-lg font-bold">Math behind numbers</h2>
                    <Button
                      className="absolute top-0 right-0 m-4 bg-transparent hover:bg-transparent focus:outline-none focus:ring-0"
                      onClick={closeModal}
                      aria-label="Close"
                      style={{ borderWidth: 0 }}
                    >
                      <XCircleIcon className="h-6 w-6 text-gray-900 hover:text-red-500" aria-hidden="true" />
                    </Button>
                  </div>
                  <div>
                    <p className="text-gray-700 max-w-4xl">
                      <b>Signal</b>
                      <br />
                      <br />
                      The <code>signal</code> column is a measure of the
                      relative frequency of a particular disease for a
                      particular plant.
                      <br />
                      <code>
                        signal = signal_per_disease /
                        all_disease_signal_for_plant
                      </code>
                      <br />
                      It is a number between 0 and 1, where 0 indicates that
                      the disease is not present for that plant, and 1
                      indicates that the disease is the only disease present
                      for that plant.
                      <br />
                      <br />
                      <b>Restock</b>
                      <br />
                      <br />
                      The <code>restock</code> variable is a binary variable
                      that indicates whether a particular plan be restocked
                      based on the new and old inventory levels (past year)
                      and the <code>signal</code>. The calculated new
                      inventory level is determined by adding 20% of the old
                      inventory level and
                      <code> 0.20 * old inventory * signal</code> value. If
                      the new inventory level is less than the calculated old
                      inventory level or is zero, the <code>restock</code>{" "}
                      value is set to 1, indicating that the plant needs to be
                      restocked. Otherwise, the <code>restock</code> value is
                      set to 0, indicating that the plant does not need to be
                      restocked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Button onClick={openModalDis} size="xs" className="ml-2">
                Disease - Brand Mapping
              </Button>
              <div className={`modal flex items-center justify-center ${isOpenDis ? "" : "hidden"}`}>
                <div className="rounded-lg p-6">
                  <div className="mb-4 flex justify-center" style={{ display: "flex", justifyContent: "space-between" }}>
                    <h2 className="text-lg font-bold">Disease Brand Mapping</h2>
                    <Button
                      className="absolute top-0 right-0 m-4 bg-transparent hover:bg-transparent focus:outline-none focus:ring-0"
                      onClick={closeModalDis}
                      aria-label="Close"
                      style={{ borderWidth: 0 }}
                    >
                      <XCircleIcon className="h-6 w-6 text-gray-900 hover:text-red-500" aria-hidden="true" />
                    </Button>
                  </div>
                  <div>
                    <Table className="table-auto mt-6 h-26p5 scrollbar-thin">
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell className="bg-gray-100">
                            Disease
                          </TableHeaderCell>
                          <TableHeaderCell className="bg-gray-100">
                            Brand
                          </TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {disBrandMapping.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.disease}</TableCell>
                            <TableCell>
                              {item.product.map((brand, index) => (
                                <div key={index}>
                                  <Badge className="my-1">{brand}</Badge>
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
            <Modal />
            <div>
              <Button
                onClick={handleButtonClick}
                size="xs"
                className="ml-2"
                color={`${filters.remove_not_available ? "red" : "blue"}`}
              >
                {filters.remove_not_available
                  ? "Add Not Available SKU"
                  : "Remove Not Available SKU"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Card className="h-4/5 mt-4">
        <div className="flex justify-between">
          <div className="flex">
            <SearchSelect
              onValueChange={handlePlantChange}
              placeholder="Select Plant"
              className="w-32 mr-2"
            >
              {uniquePlants.map((plant, index) => (
                <SearchSelectItem key={index} value={plant}>
                  {plant}
                </SearchSelectItem>
              ))}
            </SearchSelect>

            <SearchSelect
              onValueChange={handleDiseaseChange}
              placeholder="Select Disease"
              className="w-32 mr-2"
            >
              {uniqueDiseases.map((disease) => (
                <SearchSelectItem key={disease} value={disease}>
                  {disease}
                </SearchSelectItem>
              ))}
            </SearchSelect>

            <SearchSelect
              onValueChange={handleMaterialChange}
              placeholder="Select Material"
              className="w-32 mr-2"
            >
              {uniqueMaterials.map((material) => (
                <SearchSelectItem key={material} value={material}>
                  {material}
                </SearchSelectItem>
              ))}
            </SearchSelect>
          </div>

          <div>
            <SearchSelect
              onValueChange={handleRestockStatusChange}
              placeholder="Select Restock Status"
              className="w-52"
            >
              <SearchSelectItem key="all" value="All">
                All
              </SearchSelectItem>
              <SearchSelectItem key="1" value="1">
                Restock Required
              </SearchSelectItem>

              <SearchSelectItem key="0" value="0">
                Sufficient Quantity Available
              </SearchSelectItem>
            </SearchSelect>
          </div>
        </div>
        <Table className="table-auto mt-6 h-90 scrollbar-thin">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Plant</TableHeaderCell>
              <TableHeaderCell>Disease</TableHeaderCell>
              <TableHeaderCell>Signal</TableHeaderCell>
              <TableHeaderCell>Brand</TableHeaderCell>
              <TableHeaderCell>Material</TableHeaderCell>
              <TableHeaderCell>Previous Year <br></br>Inventory</TableHeaderCell>
              <TableHeaderCell>Current <br></br>Inventory</TableHeaderCell>
              <TableHeaderCell>Restock</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDetails.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.disease}</TableCell>
                <TableCell>{item.signal}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.material}</TableCell>
                <TableCell>{item.old_inventory}</TableCell>
                <TableCell>{item.current_inventory}</TableCell>
                <TableCell>
                  {item.restock === 1
                    ? <Badge onClick={() => openModalStock(item.product, item.material, item.name)} color="red">
                        Restock Required
                    </Badge>
                    : <Badge color="green">
                      Sufficient Stock
                    </Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="container" style={{color: "gray"}}>
        <span>
          For feedback, comments or issues, contact<a href="mailto: MachineLearning@syngenta.com">&nbsp;ML Team</a>
        </span>
        <span>
          Data last updated on {Data.last_update}
        </span>
      </div>
    </main>
  );
}
