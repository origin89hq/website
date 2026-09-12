import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { catalogue, catalogueGroups, counts } from "../lib/catalogue";
import { siteConfig } from "../lib/site-config";

const evidenceLabels: Record<string, string> = {
  documented: "Documented research",
  captured: "Traffic captured",
  inferred: "Inferred",
  unverified: "Unverified research",
};
export interface EquipmentFilters {
  q: string;
  group: string;
  evidence: string;
}
export function EquipmentPage({
  filters = { q: "", group: "", evidence: "" },
  onFiltersChange,
}: {
  filters?: EquipmentFilters;
  onFiltersChange?: (filters: EquipmentFilters) => void;
}) {
  const [values, setValues] = useState(filters),
    [limit, setLimit] = useState(24);
  useEffect(() => {
    setValues({ q: filters.q, group: filters.group, evidence: filters.evidence });
    setLimit(24);
  }, [filters.q, filters.group, filters.evidence]);
  const found = useMemo(() => {
    const words = values.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return catalogue.filter(
      (entry) =>
        words.every((word) =>
          (entry.model + " " + entry.profile + " " + entry.family).toLowerCase().includes(word),
        ) &&
        (!values.group || entry.family === values.group) &&
        (!values.evidence || entry.confidence === values.evidence),
    );
  }, [values]);
  function change(key: keyof EquipmentFilters, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    setLimit(24);
    onFiltersChange?.(next);
  }
  return (
    <SiteShell>
      <PageIntro eyebrow="EQUIPMENT RESEARCH" title="Start with the equipment you have.">
        <p>
          Find your exact model and its documented interfaces. For specifications, source records
          and downloadable tables, visit Origin89 Data.
        </p>
        <a className="underlined-action" href={siteConfig.data}>
          Explore data.origin89.com <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </PageIntro>
      <section className="catalogue-summary">
        <strong>{counts.entries.toLocaleString("en")}</strong>
        <div>
          <h2>catalogue entries to explore</h2>
          <p>
            {counts.connected} communication / I/O entries · {counts.passive} passive-equipment
            entries
          </p>
          <small>
            Research coverage, including series and repeated models. This is not a count of
            supported devices.
          </small>
        </div>
      </section>
      <section className="content-section catalogue-section">
        <div className="catalogue-controls">
          <div>
            <label htmlFor="equipment-query">Make or model</label>
            <input
              id="equipment-query"
              type="search"
              value={values.q}
              onChange={(event) => change("q", event.target.value)}
              placeholder="EPEVER, Victron, EG4…"
            />
          </div>
          <div>
            <label htmlFor="equipment-group">Equipment group</label>
            <select
              id="equipment-group"
              value={values.group}
              onChange={(event) => change("group", event.target.value)}
            >
              <option value="">All groups</option>
              {catalogueGroups.map((group) => (
                <option key={group.family}>{group.family}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="equipment-evidence">Research evidence</label>
            <select
              id="equipment-evidence"
              value={values.evidence}
              onChange={(event) => change("evidence", event.target.value)}
            >
              <option value="">All evidence</option>
              {[...new Set(catalogue.map((entry) => entry.confidence))].sort().map((value) => (
                <option key={value} value={value}>
                  {evidenceLabels[value] || value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="catalogue-result-count" role="status">
          Showing {Math.min(limit, found.length).toLocaleString("en")} of{" "}
          {found.length.toLocaleString("en")} matching entries
        </p>
        <div className="catalogue-rows">
          {found.slice(0, limit).map((entry) => (
            <article key={`${entry.profile}-${entry.model}`}>
              <div>
                <h2>{entry.model}</h2>
                <code>{entry.profile}</code>
              </div>
              <div>
                <span>{entry.family}</span>
                <small>{entry.passive ? "No data interface" : "Integration unconfirmed"}</small>
              </div>
              <span className="catalogue-evidence">
                {evidenceLabels[entry.confidence] || entry.confidence}
              </span>
              <a
                href={`/contact/?equipment=${encodeURIComponent(entry.model)}&profile=${encodeURIComponent(entry.profile)}`}
              >
                Ask about this model ↗
              </a>
            </article>
          ))}
        </div>
        {!found.length && (
          <div className="catalogue-empty">
            <h2>No exact match yet.</h2>
            <p>
              Try a shorter model number, clear a filter, or bring the model label to the setup
              conversation.
            </p>
            <button
              type="button"
              onClick={() => {
                const next = { q: "", group: "", evidence: "" };
                setValues(next);
                onFiltersChange?.(next);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        {limit < found.length && (
          <button
            className="catalogue-more"
            type="button"
            onClick={() => {
              const previous = limit;
              setLimit(limit + 24);
              requestAnimationFrame(() =>
                document
                  .querySelectorAll<HTMLAnchorElement>(".catalogue-rows article a")
                  [previous]?.focus({ preventScroll: true }),
              );
            }}
          >
            Show 24 more <span>↓</span>
          </button>
        )}
        <p className="catalogue-note">
          A model in the catalogue is a starting point. Its interface, available readings, intended
          actions and hardware testing determine compatibility.
        </p>
      </section>
    </SiteShell>
  );
}
