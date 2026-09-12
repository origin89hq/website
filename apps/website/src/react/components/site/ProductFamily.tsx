import { ArrowUpRight } from "lucide-react";
import { products } from "../../lib/products";
import { controllerImage, journalAssets } from "../../lib/react-assets";
import { BuddyAvatar } from "../buddy/BuddyAvatar";
export function ProductFamily() {
  return (
    <section className="product-family" id="products">
      <div className="section-heading">
        <span className="micro">THE ORIGIN89 SYSTEM</span>
        <h2>Local control, with an app to check in.</h2>
        <a className="underlined-action" href="/products/">
          Explore the products <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="product-family-grid">
        {products.map((product, index) => (
          <article key={product.id}>
            <a
              className={`family-art family-${product.id}`}
              href={`/products/${product.id}/`}
              aria-label={`Explore ${product.name}`}
            >
              {product.id === "controller" ? (
                <img
                  src={controllerImage}
                  alt="Origin89 Controller CAD concept"
                  width="340"
                  height="240"
                  loading="lazy"
                />
              ) : product.id === "buddy" ? (
                <BuddyAvatar
                  src={journalAssets.buddy}
                  alt="Buddy"
                  loading="lazy"
                  framing="avatar"
                  size={128}
                  sizes="(max-width: 760px) 112px, 128px"
                />
              ) : (
                <div className="mini-app" aria-hidden="true">
                  <span>OFFGRID / SAMPLE</span>
                  <strong>
                    Your site.
                    <br />
                    At a glance.
                  </strong>
                  <div>
                    <span>Battery</span>
                    <b>76%</b>
                  </div>
                  <small>Updated 8 sec ago</small>
                </div>
              )}
            </a>
            <span className="micro">
              0{index + 1} / {product.role}
            </span>
            <h3>{product.name}</h3>
            <p>{product.summary}</p>
            <a href={`/products/${product.id}/`}>
              <span>
                Explore{" "}
                {product.id === "offgrid"
                  ? "the app"
                  : product.id === "controller"
                    ? "the Controller"
                    : "Buddy"}
              </span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
