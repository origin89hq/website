import { ArrowUpRight } from "lucide-react";
import { sourceProjects } from "../../lib/source-projects";
import { GitHubIcon } from "./GitHubIcon";

export function SourceProjects({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`source-projects${compact ? " source-projects-compact" : ""}`}>
      {sourceProjects.map((project, index) => (
        <article className="source-project" key={project.id}>
          <span className="source-number" aria-hidden="true">
            0{index + 1}
          </span>
          <div className="source-project-heading">
            <span className="micro">{project.category}</span>
            <h3>
              <a href={project.repository} target="_blank" rel="noreferrer">
                {project.name}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </h3>
            {!compact && <span className="source-format">{project.format}</span>}
          </div>
          <div className="source-project-detail">
            <p>{project.summary}</p>
            {!compact && <p className="source-contents">{project.contents}</p>}
            <div className="source-file-links">
              {(compact ? project.links.slice(0, 1) : project.links).map(([label, href]) => (
                <a key={href} href={href} target="_blank" rel="noreferrer">
                  {label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          {!compact && (
            <div className="source-project-meta">
              <a href={project.repository} target="_blank" rel="noreferrer">
                <GitHubIcon width={16} height={16} />
                {`origin89hq/${project.id}`}
              </a>
              <span>{project.license}</span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
