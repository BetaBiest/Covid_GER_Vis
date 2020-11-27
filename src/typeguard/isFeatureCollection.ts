import { FeatureCollection } from "geojson";

export function isFeatureCollection(value: any): value is FeatureCollection {
  return (value as FeatureCollection).type == "FeatureCollection";
}
