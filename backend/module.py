from datetime import datetime, timedelta

import pandas as pd


class Module:
    def __init__(self) -> None:
        self.plants = pd.read_csv("data/warehouse.csv")
        self.data = pd.read_csv("data/dis_model.csv")
        self.disease = pd.read_csv("data/disease.csv")
        self.mat_count = {
            4466: 521,
            4468: 696,
            4462: 295,
            4475: 105,
            4464: 251,
            4465: 191,
            4463: 190,
            4478: 32,
        }
    
    def num_active_disease(self):
        return self.data.disease.nunique()

    def get_warehouses(self):
        return self.plants.to_dict(orient="records")

    def get_disease_locations(self):
        # return lat, lng for disease locations
        return self.disease[["latitude", "longitude"]].values.tolist()

    def num_plants_restock(self):
        df = self.data[self.data["restock"] == 1]
        return df.plant_id.nunique()

    def ps_warehouse(self):
        df = self.data[self.data["restock"] == 1]

        # now for each plant_id count of material_id by mat_count
        # Group the DataFrame by plant_id and count the number of occurrences of material_id in each group
        grouped_counts = df.groupby("plant_id").count()["material_id"].reset_index()

        # Map the plant_id to the corresponding material count
        material_counts = (
            df["plant_id"].map(self.mat_count).drop_duplicates().reset_index(drop=True)
        )

        df = df[["plant_id", "name"]].drop_duplicates().reset_index(drop=True)

        # Calculate the stat column by dividing the grouped counts by the material counts
        df["stat"] = grouped_counts["material_id"].values / material_counts.values
        df["stat"] = (df["stat"] * 100).round(1)

        df = df[["name", "stat"]]

        df["status"] = df.apply(lambda x: self._get_deltaType(x["stat"]), axis=1)
        # sort by stat
        df = df.sort_values(by="stat", ascending=False)
        # take top 4
        df = df.head(4)
        df["stat"] = df["stat"].astype(str) + "%"

        return df[["name", "stat", "status"]].to_dict(orient="records")

    def get_details(self):
        return {
            "details_table": self.data.drop(["plant_id", "material_id"], axis=1)
            .drop_duplicates()
            .to_dict(orient="records"),
            "dis_brand_mapping": self.data.groupby("disease")["product"]
            .apply(set)
            .apply(list)
            .reset_index()
            .to_dict(orient="records"),
        }

    def get_disease_map(self, plant=None, disease=None):
        df = self.disease.copy()
        plants = self.plants.copy()
        dropdown_plants = ["All Plants"] + self.data.name.unique().tolist()
        dropdown_diseases = ["All Disease"] + self.data.disease.unique().tolist()

        if plant and plant != "All Plants":
            df = df[df["plant"] == plant]
            plants = plants[plants["name"] == plant]

        if disease and disease != "All Disease":
            df = df[df["disease"] == disease]

        res = {
            "plant": plants.to_dict(orient="records"),
            "disease": df[["latitude", "longitude"]].values.tolist(),
            "dropdown_plants": dropdown_plants,
            "dropdown_diseases": dropdown_diseases,
            "table": df[["plant", "state", "disease"]]
            .drop_duplicates()
            .to_dict(orient="records"),
        }

        return res

    def _get_deltaType(self, num):
        if num < 0:
            return "decrease"
        elif num < 10:
            return "moderateDecrease"
        elif num < 20:
            return "unchanged"
        elif num < 30:
            return "moderateIncrease"
        else:
            return "increase"
