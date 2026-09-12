import data from "../generated/catalogue.json";
export interface EquipmentEntry {
  model: string;
  profile: string;
  family: string;
  confidence: string;
  passive: boolean;
}
// Build-time extraction publishes the model-table fields, not internal research prose.
export const catalogue: EquipmentEntry[] = data.catalogue;
export const catalogueGroups = data.groups;
export const counts = data.counts;
