import type { Locale } from "@/content/site";
import type { ProjectDossier } from "@/services/types";
import type { Project } from "@/services/types";

export type C4NodeKind =
  | "person"
  | "system"
  | "client"
  | "container"
  | "component"
  | "store"
  | "queue"
  | "external";

export interface C4Node {
  kind: C4NodeKind;
  title: string;
  sub?: string;
  leaf?: boolean;
}

export interface C4Level {
  label: string;
  note?: string;
  tiers: C4Node[][];
}

export interface Adr {
  id: string;
  title: string;
  status: string;
  date?: string;
  context: string;
  decision: string;
  tradeoff?: string;
}

export interface LogEntry {
  hash: string;
  tag?: string;
  date: string;
  title: string;
  note?: string;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  kind?: "return";
}

export interface SequenceData {
  actors: string[];
  messages: SequenceMessage[];
}

export interface Entity {
  name: string;
  kind?: "table" | "class" | "abstract" | "interface" | "enum";
  rows?: string[];
}

export interface SchemaRelation {
  from: string;
  label: string;
  to: string;
}

export interface SchemaData {
  tiers: Entity[][];
  relations?: SchemaRelation[];
}

export type FlowKind =
  | "start"
  | "end"
  | "state"
  | "final"
  | "step"
  | "decision"
  | "error"
  | "store";

export interface FlowNode {
  kind: FlowKind;
  title: string;
  sub?: string;
  via?: string;
}

export interface TiersData {
  tiers: FlowNode[][];
  notes?: string[];
}

export interface MatrixRow {
  label: string;
  cells: string[];
}

export interface MatrixData {
  cols: string[];
  rows: MatrixRow[];
}

export type Diagram =
  | { id: string; kind: "c4"; title: string; note?: string; data: C4Level[] }
  | { id: string; kind: "sequence"; title: string; note?: string; data: SequenceData }
  | { id: string; kind: "schema"; title: string; note?: string; data: SchemaData }
  | { id: string; kind: "tiers"; title: string; note?: string; data: TiersData }
  | { id: string; kind: "matrix"; title: string; note?: string; data: MatrixData };

export interface DossierMetric {
  value: string;
  label: string;
  note?: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  caption: string;
  hint?: string;
}

export interface ProjectDetail {
  metrics: DossierMetric[];
  c4: C4Level[];
  adrs: Adr[];
  log: LogEntry[];
  diagrams: Diagram[];
  gallery: GalleryItem[];
}

export interface DossierProject {
  slug: string;
  title: string;
  summary: string;
  description: string;
  impact: string;
  technologies: string[];
  featured: boolean;
  details?: ProjectDetail;
}

interface ApiC4Node {
  kind: C4NodeKind;
  title: string;
  sub?: string | null;
  leaf?: boolean;
}

interface ApiC4Level {
  label: string;
  note?: string | null;
  tiers: ApiC4Node[][];
}

const byOrder = <T extends { display_order: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.display_order - b.display_order);

const mapC4Level = (level: ApiC4Level): C4Level => ({
  label: level.label,
  note: level.note ?? undefined,
  tiers: level.tiers.map((tier) =>
    tier.map((node) => ({
      kind: node.kind,
      title: node.title,
      sub: node.sub ?? undefined,
      leaf: node.leaf,
    })),
  ),
});

const mapDiagram = (diagram: ProjectDossier["diagrams"][number]): Diagram => {
  const data = diagram.data as unknown as Record<string, unknown>;
  const note = diagram.note ?? undefined;

  if (diagram.kind === "c4") {
    return {
      id: diagram.id,
      kind: "c4",
      title: diagram.title,
      note,
      data: ((data.levels as ApiC4Level[] | undefined) ?? []).map(mapC4Level),
    };
  }

  if (diagram.kind === "sequence") {
    const messages = Array.isArray(data.messages) ? data.messages : [];
    return {
      id: diagram.id,
      kind: "sequence",
      title: diagram.title,
      note,
      data: {
        actors: Array.isArray(data.actors) ? (data.actors as string[]) : [],
        messages: messages.map((message) => {
          const item = message as { from: string; to: string; label: string; kind?: string | null };
          return {
            from: item.from,
            to: item.to,
            label: item.label,
            kind: item.kind === "return" ? "return" : undefined,
          };
        }),
      },
    };
  }

  if (diagram.kind === "schema") {
    const tiers = Array.isArray(data.tiers) ? data.tiers : [];
    return {
      id: diagram.id,
      kind: "schema",
      title: diagram.title,
      note,
      data: {
        tiers: tiers as Entity[][],
        relations: Array.isArray(data.relations) ? (data.relations as SchemaRelation[]) : [],
      },
    };
  }

  if (diagram.kind === "matrix") {
    return {
      id: diagram.id,
      kind: "matrix",
      title: diagram.title,
      note,
      data: {
        cols: Array.isArray(data.cols) ? (data.cols as string[]) : [],
        rows: Array.isArray(data.rows) ? (data.rows as MatrixRow[]) : [],
      },
    };
  }

  return {
    id: diagram.id,
    kind: "tiers",
    title: diagram.title,
    note,
    data: {
      tiers: (Array.isArray(data.tiers) ? data.tiers : []) as FlowNode[][],
      notes: Array.isArray(data.notes) ? (data.notes as string[]) : [],
    },
  };
};

export function toDossierProject(
  project: Project,
  dossier: ProjectDossier | null,
  _locale: Locale,
): DossierProject {
  const details: ProjectDetail | undefined = dossier
    ? {
        metrics: byOrder(dossier.metrics).map((metric) => ({
          value: metric.value,
          label: metric.label,
          note: metric.note ?? undefined,
        })),
        c4: byOrder(dossier.c4).map(mapC4Level),
        adrs: byOrder(dossier.adrs).map((adr) => ({
          id: adr.id,
          title: adr.title,
          status: adr.status,
          date: adr.date ?? undefined,
          context: adr.context,
          decision: adr.decision,
          tradeoff: adr.tradeoff ?? undefined,
        })),
        log: byOrder(dossier.log).map((entry) => ({
          hash: entry.hash,
          tag: entry.tag ?? undefined,
          date: entry.date,
          title: entry.title,
          note: entry.note ?? undefined,
        })),
        diagrams: byOrder(dossier.diagrams).map(mapDiagram),
        gallery: byOrder(dossier.gallery).map((item) => ({
          id: item.id,
          src: item.src,
          caption: item.caption,
          hint: item.hint ?? undefined,
        })),
      }
    : undefined;

  if (details && details.c4.length > 0) {
    details.diagrams = [
      {
        id: "c4",
        kind: "c4",
        title: "C4 Model",
        note: "semantic zoom — click nodes to descend",
        data: details.c4,
      },
      ...details.diagrams,
    ];
  }

  return {
    slug: project.slug,
    title: project.title,
    summary: project.short_description?.trim() || project.description,
    description: project.description,
    impact: dossier?.impact ?? "",
    technologies: (project.technologies || []).map((technology) => technology.name),
    featured: project.featured,
    details,
  };
}
