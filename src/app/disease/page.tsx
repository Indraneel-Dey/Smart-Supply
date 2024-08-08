"use client";

import { useEffect, useState } from "react";
import { SearchSelect, SearchSelectItem } from "@tremor/react";
import Map from "./map";
import {
  Card,
  Col,
  Grid,
  Button,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell
} from "@tremor/react";
import {
  HomeIcon
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface DataType {
  disease: [number, number][];
  plant: {
    place_id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
  }[];
  table: {
    plant: string;
    state: string;
    disease: string;
  }[];
  dropdown_plants: string[];
  dropdown_diseases: string[];
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

interface MasterType {
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

export default function Home() {
  const router = useRouter();
  const [Data, setData] = useState<DataType>({
    disease: [],
    plant: [],
    table: [],
    dropdown_plants: [],
    dropdown_diseases: [],
  });
  const [master, setMaster] = useState<MasterType>({
    addressPoints: [],
    kpi: [],
    warehouses: [],
    res_table: [],
    last_update: ""
  });

  const [selected, setSelected] = useState({ plant: "", disease: "" });

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`api/disease-details`);
      // const response = await fetch(`http://localhost:8000/api/disease-details`);
      const data = await response.json();
      setData(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`api`);
      // const response = await fetch(`http://localhost:8000/api`);
      const data = await response.json();
      setMaster(data);
    }

    fetchData();
  }, []);

  const handlePlantSelect = (plantName: string) => {
    setSelected({ ...selected, plant: plantName });
    fetchData(selected.disease, plantName);
  };

  const handleDiseaseSelect = (diseaseName: string) => {
    setSelected({ ...selected, disease: diseaseName });
    fetchData(diseaseName, selected.plant);
  };

  const fetchData = (disease: string, plant: string) => {
    const url = `api/disease-details?disease=${disease}&plant=${plant}`;
    // const url = `http://localhost:8000/api/disease-details?disease=${disease}&plant=${plant}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <main className="h-full flex flex-col">
      <div className="flex justify-between h-10">
        <div>
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
          <div className="text-xl font-bold">Disease Cluster</div>
        </div>
        <div>
          <div className="flex gap-4">
            <SearchSelect
              placeholder="Select Plant"
              onValueChange={handlePlantSelect}
            >
              {Data.dropdown_plants.map((plant) => (
                <SearchSelectItem key={plant} value={plant}>
                  {plant}
                </SearchSelectItem>
              ))}
            </SearchSelect>
            <SearchSelect
              placeholder="Select Disease"
              onValueChange={handleDiseaseSelect}
            >
              {Data.dropdown_diseases.map((disease) => (
                <SearchSelectItem key={disease} value={disease}>
                  {disease}
                </SearchSelectItem>
              ))}
            </SearchSelect>
            {/* <Select>
              <SelectItem value="4">Nautical Miles</SelectItem>
            </Select> */}
          </div>
        </div>
      </div>
      <Grid numItemsLg={12} className="gap-3 mt-4 h-4/5">
        {/* Main section */}
        <Col numColSpanLg={6}>
          <Card className="h-90 p-0 dark:bg-black">
            <Map points={Data.disease} warehouses={Data.plant} />
          </Card>
        </Col>
        {/* Side section */}
        <Col numColSpanLg={6}>
          <Card className="h-90">
            <Table className="table-auto h-72vh scrollbar-thin">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Plant</TableHeaderCell>
                  <TableHeaderCell>State</TableHeaderCell>
                  <TableHeaderCell>Disease</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Data.table.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.plant}</TableCell>
                    <TableCell>{row.state}</TableCell>
                    <TableCell>{row.disease}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Col>
      </Grid>
      <div className="container" style={{color: "gray"}}>
          <span>
            For feedback, comments or issues, contact<a href="mailto: MachineLearning@syngenta.com">&nbsp;ML Team</a>
          </span>
          <span>
            Data last updated on { master.last_update }
          </span>
        </div>
    </main>
  );
}
