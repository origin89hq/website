import { ArrowUpRight } from "lucide-react";
import { sourceProjects } from "../../lib/source-projects";
import { GitHubIcon } from "./GitHubIcon";

export function SourceProjects({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`source-projects${compact ? " source-projects-compact" : ""}`}>
      {sourceProjects.map((project) => (
        <article className="source-project" key={project.id}>
          <div className="source-project-heading">
            <h3>
              <a href={project.repository} target="_blank" rel="noreferrer">
                {project.name}
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </h3>
            <p className="source-kind">{project.category}</p>
          </div>
          <div className="source-project-detail">
            <p>{project.summary}</p>
            {!compact && <p className="source-contents">{project.contents}</p>}
            <div className="source-file-links">
              {(compact ? project.links.slice(0, 1) : project.links).map(([label, href]) => (
                <a key={href} href={href} target="_blank" rel="noreferrer">
                  {label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          {!compact && (
            <dl className="source-project-meta">
              <div>
                <dt>Repository</dt>
                <dd>
                  <a href={project.repository} target="_blank" rel="noreferrer">
                    <GitHubIcon width={14} height={14} />
                    {`origin89hq/${project.id}`}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Formats</dt>
                <dd>{project.format}</dd>
              </div>
              <div>
                <dt>Licence</dt>
                <dd>{project.license}</dd>
              </div>
            </dl>
          )}
        </article>
      ))}
    </div>
  );
}
