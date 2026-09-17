import { ArrowRight } from "lucide-react";
import { type ProductId, products } from "../../lib/products";
import { buddyFullBody, controllerImage } from "../../lib/react-assets";
import { EquipmentIllustration } from "./EquipmentIllustration";
import "../../styles/energy-dashboard.css";

const actionLabels: Record<ProductId, string> = {
  controller: "Explore the Controller",
  offgrid: "Explore the app",
  buddy: "Explore Buddy",
};

// Sample readings from the cottage app overview.
const sampleFlow = [
  { kind: "solar", reading: "2.10", unit: "kW", label: "Solar production" },
  { kind: "generator", reading: "Standby", unit: null, label: "Generator" },
  { kind: "cottage", reading: "0.85", unit: "kW", label: "Cottage use" },
  { kind: "battery", reading: "76", unit: "%", label: "Charging" },
] as const;

function FamilyArt({ productId }: { productId: ProductId }) {
  switch (productId) {
    case "controller":
      return (
        <img
          src={controllerImage}
          alt="Origin89 Controller, rendered from CAD"
          width="1200"
          height="1824"
          loading="lazy"
        />
      );
    case "offgrid":
      return (
        <div className="mini-app app-journal app-site-cottage" aria-hidden="true">
          <div className="mini-app-top">
            <div>
              <span className="mini-app-wordmark">
                ORIGIN89 <b>OFFGRID</b>
              </span>
              <strong className="mini-app-site">Lac des Pins</strong>
            </div>
            <span className="mini-app-avatar">LP</span>
          </div>
          <div className="mini-app-fresh">
            <span className="live-dot" />
            Sample cottage · Readings 8 sec ago
          </div>
          <strong className="mini-app-title">Running on sunshine.</strong>
          <div className="mini-app-flow">
            {sampleFlow.map(({ kind, reading, unit, label }) => (
              <div key={kind}>
                <EquipmentIllustration kind={kind} />
                <strong className={unit ? undefined : "mini-app-state"}>
                  {reading}
                  {unit && <small>{unit}</small>}
                </strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "buddy":
      return <img src={buddyFullBody} alt="Buddy" width="1280" height="1434" loading="lazy" />;
  }
}

export function ProductFamily({ linkToProducts = true }: { linkToProducts?: boolean }) {
  return (
    <section className="product-family" id="products" aria-labelledby="product-family-title">
      <div className="product-family-heading">
        <h2 id="product-family-title">Local control, with an app to check in.</h2>
        {linkToProducts && (
          <a className="o89-text-link" href="/products/">
            Explore the products <ArrowRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="product-family-grid">
        {products.map((product) => (
          <article key={product.id} className="family-card">
            <div className={`family-art family-${product.id}`}>
              <FamilyArt productId={product.id} />
            </div>
            <h3>{product.name}</h3>
            <p>{product.summary}</p>
            <a className="family-link" href={`/products/${product.id}/`}>
              {actionLabels[product.id]} <ArrowRight size={16} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
