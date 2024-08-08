"use client";

import { useEffect, useState } from "react";
import Map from "../components/map";
import {
  Card,
  Metric,
  Col,
  Text,
  Flex,
  BadgeDelta,
  DeltaType,
  Grid,
  Bold,
  List,
  ListItem,
  Button
} from "@tremor/react";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

export default function Home() {
  const router = useRouter();
  const [Data, setData] = useState<DataType>({
    addressPoints: [],
    kpi: [],
    warehouses: [],
    res_table: [],
    last_update: ""
  });

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`api`);
      // const response = await fetch(`http://localhost:8000/api`);
      const data = await response.json();
      setData(data);
    }

    fetchData();
  }, []);

  return (
    <main className="h-full flex flex-col">
      <div className="flex justify-between h-10">
        <div>
          <div className="text-xl font-bold">Smart Supply</div>
          <div className="text-sm opacity-60">Optimize inventory by leveraging CropWise insights</div>
        </div>
        <div>
          <Image
            src="https://dmreader.vercel.app/logo.svg"
            alt="Syngenta Logo"
            width={140}
            height={10}
          />
        </div>
      </div>
      <Grid numItems={12} className="gap-3">
        <Col numColSpanLg={9}>
          <Card className="h-full p-0">
            <Map points={Data.addressPoints} warehouses={Data.warehouses} />
          </Card>
        </Col>
        <Col numColSpanLg={3} className="flex flex-wrap content-between h-full gap-3">
          {Data.kpi.map((item) => (
            <Card key={item.title} className="w-full pb-3">
              <Flex justifyContent="start" className="space-x-4">
                <div className="pb-2">
                  <Text className="mr-2">Disease Clusters Identified</Text>
                  <Metric className="truncate text-4xl text-gray-800">{item.metric}</Metric>
                </div>
              </Flex>
              <Flex className="pt-3 border-t">
                <Button
                  size="xs"
                  variant="light"
                  icon={ArrowLongRightIcon}
                  iconPosition="right"
                  onClick={() => router.push("/disease")}
                >
                  View Clusters
                </Button>
              </Flex>
            </Card>
          ))}
          {Data.res_table.map((item, index) => (
            <Card className="w-full pb-3" key={index}>
              <Text>Requiring Restocking</Text>
              <Metric className="text-4xl text-gray-800">{item.num_plants}</Metric>
              <Flex className="mt-6">
                <Text>
                  <Bold>Warehouse</Bold>
                </Text>
                <Text>
                  <Bold>Materials</Bold>
                </Text>
              </Flex>
              <List className="mt-1">
                {item.warehouse.map((warehouse) => (
                  <ListItem key={warehouse.name}>
                    <Flex justifyContent="start" className="truncate space-x-2.5">
                      <BadgeDelta
                        deltaType={warehouse.status as DeltaType}
                        isIncreasePositive={false}
                      />
                      <Text className="truncate">{warehouse.name}</Text>
                    </Flex>
                    <Text>{warehouse.stat}</Text>
                  </ListItem>
                ))}
              </List>
              <Flex className="pt-3 border-t">
                <Button
                  size="xs"
                  variant="light"
                  icon={ArrowLongRightIcon}
                  iconPosition="right"
                  className="mt-2"
                  onClick={() => router.push("/details")}
                >
                  View Details
                </Button>
              </Flex>
            </Card>
          ))}
        </Col>
      </Grid>
      <div className="container" style={{color: "gray"}}>
        <span>
          For feedback, comments or issues, contact<a href="mailto: MachineLearning@syngenta.com">&nbsp;ML Team</a>
        </span>
        <span>
          Data last updated on { Data.last_update }
        </span>
      </div>
    </main>
  );
}
