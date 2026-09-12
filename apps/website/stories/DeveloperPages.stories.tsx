import { DesignGuidePage } from "../src/react/routes/DesignGuide";
import { DevelopersPage } from "../src/react/routes/Developers";
import { EquipmentPage } from "../src/react/routes/Equipment";
import { ProductsPage } from "../src/react/routes/Products";
export default {
  title: "Website/Developer resources",
  parameters: { reviewLayout: "page" },
};
export const Developers = { render: () => <DevelopersPage /> };
export const DesignGuide = { render: () => <DesignGuidePage /> };
export const GuideOnPhone = {
  render: () => <DesignGuidePage />,
  globals: { viewport: { value: "phone", isRotated: false } },
};
export const EquipmentCatalogue = { render: () => <EquipmentPage /> };
export const EquipmentNoResults = {
  render: () => <EquipmentPage filters={{ q: "no-matching-model", group: "", evidence: "" }} />,
};
export const ProductFamily = { render: () => <ProductsPage /> };
