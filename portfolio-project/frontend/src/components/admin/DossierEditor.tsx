"use client";

import { useEffect, useState } from "react";

import type { AdminProjectDossier, ProjectDossierUpsert } from "@/services/types";

export type DossierLanguage = "en" | "tr";
export type C4NodeKind =
  | "person"
  | "system"
  | "client"
  | "container"
  | "component"
  | "store"
  | "queue"
  | "external";
export type DiagramKind = "c4" | "sequence" | "schema" | "tiers" | "matrix";

export interface DossierMetricForm {
  value: string;
  numericValue: string;
  label: string;
  note: string;
  displayOrder: number;
}

export interface DossierC4NodeForm {
  kind: C4NodeKind;
  title: string;
  sub: string;
  leaf: boolean;
  tierOrder: number;
  displayOrder: number;
}

export interface DossierC4LevelForm {
  label: string;
  note: string;
  tiers: DossierC4NodeForm[][];
  displayOrder: number;
}

export interface DossierAdrForm {
  id: string;
  title: string;
  status: string;
  date: string;
  context: string;
  decision: string;
  tradeoff: string;
  displayOrder: number;
}

export interface DossierLogEntryForm {
  hash: string;
  tag: string;
  date: string;
  title: string;
  note: string;
  displayOrder: number;
}

export interface SequenceMessageForm {
  from: string;
  to: string;
  label: string;
  kind: "return" | "";
}

export interface SchemaEntityForm {
  name: string;
  kind: "table" | "class" | "abstract" | "interface" | "enum" | "";
  rows: string[];
}

export interface SchemaRelationForm {
  from: string;
  label: string;
  to: string;
}

export interface FlowNodeForm {
  kind: "start" | "end" | "state" | "final" | "step" | "decision" | "error" | "store";
  title: string;
  sub: string;
  via: string;
}

export interface MatrixRowForm {
  label: string;
  cells: string[];
}

export type DossierDiagramDataForm =
  | { kind: "c4"; levels: DossierC4LevelForm[] }
  | { kind: "sequence"; actors: string[]; messages: SequenceMessageForm[] }
  | { kind: "schema"; tiers: SchemaEntityForm[][]; relations: SchemaRelationForm[] }
  | { kind: "tiers"; tiers: FlowNodeForm[][]; notes: string[] }
  | { kind: "matrix"; cols: string[]; rows: MatrixRowForm[] };

export interface DossierDiagramForm {
  id: string;
  kind: DiagramKind;
  title: string;
  note: string;
  data: DossierDiagramDataForm;
  displayOrder: number;
}

export interface DossierGalleryItemForm {
  id: string;
  src: string;
  caption: string;
  hint: string;
  displayOrder: number;
}

export interface DossierFormValues {
  impactEn: string;
  impactTr: string;
  metrics: DossierMetricForm[];
  c4: DossierC4LevelForm[];
  adrs: DossierAdrForm[];
  log: DossierLogEntryForm[];
  diagrams: DossierDiagramForm[];
  gallery: DossierGalleryItemForm[];
}

const newIdentifier = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyC4Node = (): DossierC4NodeForm => ({
  kind: "component",
  title: "",
  sub: "",
  leaf: false,
  tierOrder: 0,
  displayOrder: 0,
});

const emptyC4Level = (): DossierC4LevelForm => ({
  label: "",
  note: "",
  tiers: [[emptyC4Node()]],
  displayOrder: 0,
});

const emptyDiagramData = (kind: DiagramKind): DossierDiagramDataForm => {
  if (kind === "c4") return { kind, levels: [] };
  if (kind === "sequence") return { kind, actors: [""], messages: [] };
  if (kind === "schema") return { kind, tiers: [[{ name: "", kind: "", rows: [] }]], relations: [] };
  if (kind === "tiers") {
    return { kind, tiers: [[{ kind: "state", title: "", sub: "", via: "" }]], notes: [] };
  }
  return { kind, cols: [""], rows: [{ label: "", cells: [""] }] };
};

const emptyDiagram = (): DossierDiagramForm => ({
  id: newIdentifier("diagram"),
  kind: "sequence",
  title: "",
  note: "",
  data: emptyDiagramData("sequence"),
  displayOrder: 0,
});

export const emptyDossierFormValues: DossierFormValues = {
  impactEn: "",
  impactTr: "",
  metrics: [],
  c4: [],
  adrs: [],
  log: [],
  diagrams: [],
  gallery: [],
};

const cloneValues = (values: DossierFormValues): DossierFormValues =>
  JSON.parse(JSON.stringify(values)) as DossierFormValues;

type C4LevelLike = {
  label: string;
  note?: string | null;
  display_order: number;
  tiers: Array<Array<{
    kind: C4NodeKind;
    title: string;
    sub?: string | null;
    leaf: boolean;
    tier_order: number;
    display_order: number;
  }>>;
};

const toC4LevelForm = (level: C4LevelLike): DossierC4LevelForm => ({
  label: level.label,
  note: level.note ?? "",
  displayOrder: level.display_order,
  tiers: level.tiers.map((tier) =>
    tier.map((node) => ({
      kind: node.kind,
      title: node.title,
      sub: node.sub ?? "",
      leaf: node.leaf,
      tierOrder: node.tier_order,
      displayOrder: node.display_order,
    })),
  ),
});

const toDiagramForm = (diagram: AdminProjectDossier["diagrams"][number]): DossierDiagramForm => {
  const data = diagram.data;
  if (data.kind === "c4") {
    return {
      id: diagram.id,
      kind: diagram.kind,
      title: diagram.title,
      note: diagram.note ?? "",
      displayOrder: diagram.display_order,
      data: { kind: "c4", levels: data.levels?.map(toC4LevelForm) ?? [] },
    };
  }
  if (data.kind === "sequence") {
    return {
      id: diagram.id,
      kind: diagram.kind,
      title: diagram.title,
      note: diagram.note ?? "",
      displayOrder: diagram.display_order,
      data: {
        kind: "sequence",
        actors: [...data.actors],
        messages: (data.messages ?? []).map((message) => ({
          from: message.from,
          to: message.to,
          label: message.label,
          kind: message.kind ?? "",
        })),
      },
    };
  }
  if (data.kind === "schema") {
    return {
      id: diagram.id,
      kind: diagram.kind,
      title: diagram.title,
      note: diagram.note ?? "",
      displayOrder: diagram.display_order,
      data: {
        kind: "schema",
        tiers: data.tiers.map((tier) =>
          tier.map((entity) => ({ name: entity.name, kind: entity.kind ?? "", rows: [...(entity.rows ?? [])] })),
        ),
        relations: (data.relations ?? []).map((relation) => ({
          from: relation.from,
          label: relation.label,
          to: relation.to,
        })),
      },
    };
  }
  if (data.kind === "tiers") {
    return {
      id: diagram.id,
      kind: diagram.kind,
      title: diagram.title,
      note: diagram.note ?? "",
      displayOrder: diagram.display_order,
      data: {
        kind: "tiers",
        tiers: data.tiers.map((tier) =>
          tier.map((node) => ({ kind: node.kind, title: node.title, sub: node.sub ?? "", via: node.via ?? "" })),
        ),
        notes: [...(data.notes ?? [])],
      },
    };
  }
  return {
    id: diagram.id,
    kind: diagram.kind,
    title: diagram.title,
    note: diagram.note ?? "",
    displayOrder: diagram.display_order,
    data: {
      kind: "matrix",
      cols: [...data.cols],
      rows: data.rows.map((row) => ({ label: row.label, cells: [...row.cells] })),
    },
  };
};

export const formValuesFromDossier = (dossier: AdminProjectDossier): DossierFormValues => ({
  impactEn: dossier.impact_en,
  impactTr: dossier.impact_tr,
  metrics: dossier.metrics.map((metric) => ({
    value: metric.value,
    numericValue: metric.numeric_value ?? "",
    label: metric.label,
    note: metric.note ?? "",
    displayOrder: metric.display_order,
  })),
  c4: dossier.c4.map(toC4LevelForm),
  adrs: dossier.adrs.map((adr) => ({
    id: adr.id,
    title: adr.title,
    status: adr.status,
    date: adr.date ?? "",
    context: adr.context,
    decision: adr.decision,
    tradeoff: adr.tradeoff ?? "",
    displayOrder: adr.display_order,
  })),
  log: dossier.log.map((entry) => ({
    hash: entry.hash,
    tag: entry.tag ?? "",
    date: entry.date,
    title: entry.title,
    note: entry.note ?? "",
    displayOrder: entry.display_order,
  })),
  diagrams: dossier.diagrams.map(toDiagramForm),
  gallery: dossier.gallery.map((item) => ({
    id: item.id,
    src: item.src,
    caption: item.caption,
    hint: item.hint ?? "",
    displayOrder: item.display_order,
  })),
});

const toC4Payload = (levels: DossierC4LevelForm[]) =>
  levels.map((level) => ({
    label: level.label,
    note: level.note || null,
    display_order: level.displayOrder,
    tiers: level.tiers.map((tier, tierIndex) =>
      tier.map((node) => ({
        kind: node.kind,
        title: node.title,
        sub: node.sub || null,
        leaf: node.leaf,
        tier_order: tierIndex,
        display_order: node.displayOrder,
      })),
    ),
  }));

const toDiagramDataPayload = (data: DossierDiagramDataForm, c4: DossierC4LevelForm[]) => {
  if (data.kind === "c4") return { kind: "c4" as const, levels: toC4Payload(c4) };
  if (data.kind === "sequence") {
    return {
      kind: "sequence" as const,
      actors: data.actors.filter(Boolean),
      messages: data.messages
        .filter((message) => message.from && message.to && message.label)
        .map((message) => ({
          from: message.from,
          to: message.to,
          label: message.label,
          ...(message.kind ? { kind: message.kind } : {}),
        })),
    };
  }
  if (data.kind === "schema") {
    return {
      kind: "schema" as const,
      tiers: data.tiers.map((tier) =>
        tier
          .filter((entity) => entity.name)
          .map((entity) => ({
            name: entity.name,
            ...(entity.kind ? { kind: entity.kind } : {}),
            rows: entity.rows.filter(Boolean),
          })),
      ),
      relations: data.relations.filter((relation) => relation.from && relation.to && relation.label),
    };
  }
  if (data.kind === "tiers") {
    return {
      kind: "tiers" as const,
      tiers: data.tiers.map((tier) =>
        tier
          .filter((node) => node.title)
          .map((node) => ({
            kind: node.kind,
            title: node.title,
            sub: node.sub || null,
            via: node.via || null,
          })),
      ),
      notes: data.notes.filter(Boolean),
    };
  }
  return {
    kind: "matrix" as const,
    cols: data.cols.filter(Boolean),
    rows: data.rows
      .filter((row) => row.label)
      .map((row) => ({ label: row.label, cells: row.cells.filter(Boolean) })),
  };
};

export const toDossierPayload = (values: DossierFormValues): ProjectDossierUpsert =>
  ({
    impact_en: values.impactEn,
    impact_tr: values.impactTr,
    metrics: values.metrics.map((metric) => ({
      value: metric.value,
      numeric_value: metric.numericValue.trim() || null,
      label: metric.label,
      note: metric.note || null,
      display_order: metric.displayOrder,
    })),
    c4: toC4Payload(values.c4),
    adrs: values.adrs.map((adr) => ({
      id: adr.id,
      title: adr.title,
      status: adr.status,
      date: adr.date || null,
      context: adr.context,
      decision: adr.decision,
      tradeoff: adr.tradeoff || null,
      display_order: adr.displayOrder,
    })),
    log: values.log.map((entry) => ({
      hash: entry.hash,
      tag: entry.tag || null,
      date: entry.date,
      title: entry.title,
      note: entry.note || null,
      display_order: entry.displayOrder,
    })),
    diagrams: values.diagrams.map((diagram) => ({
      id: diagram.id,
      kind: diagram.kind,
      title: diagram.title,
      note: diagram.note || null,
      data: toDiagramDataPayload(diagram.data, values.c4),
      display_order: diagram.displayOrder,
    })),
    gallery: values.gallery.map((item) => ({
      id: item.id,
      src: item.src,
      caption: item.caption,
      hint: item.hint || null,
      display_order: item.displayOrder,
    })),
  }) as ProjectDossierUpsert;

interface DossierEditorProps {
  initialValues: DossierFormValues;
  onSubmit: (values: DossierFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  language: DossierLanguage;
}

type EditorSection = "overview" | "metrics" | "c4" | "adrs" | "log" | "diagrams" | "gallery";

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:text-dark-50";
const secondaryButtonClassName =
  "rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-dark-600 dark:text-dark-200 dark:hover:bg-dark-800";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
      {label}
      {children}
    </label>
  );
}

function AddRemoveRow({
  onAdd,
  onRemove,
  addLabel,
  removeLabel,
}: {
  onAdd: () => void;
  onRemove?: () => void;
  addLabel: string;
  removeLabel?: string;
}) {
  return (
    <div className="mt-3 flex gap-2">
      <button type="button" onClick={onAdd} className={secondaryButtonClassName}>
        + {addLabel}
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30">
          {removeLabel}
        </button>
      )}
    </div>
  );
}

export function DossierEditor({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  language,
}: DossierEditorProps) {
  const [values, setValues] = useState<DossierFormValues>(() => cloneValues(initialValues));
  const [section, setSection] = useState<EditorSection>("overview");
  const isTurkish = language === "tr";

  useEffect(() => {
    setValues(cloneValues(initialValues));
    setSection("overview");
  }, [initialValues]);

  const copy = {
    overview: isTurkish ? "Genel bakış" : "Overview",
    metrics: isTurkish ? "Metrikler" : "Metrics",
    c4: "C4",
    adrs: "ADR",
    log: "Log",
    diagrams: isTurkish ? "Diyagramlar" : "Diagrams",
    gallery: isTurkish ? "Galeri" : "Gallery",
    impactEn: isTurkish ? "Etki (İngilizce)" : "Impact (English)",
    impactTr: isTurkish ? "Etki (Türkçe)" : "Impact (Turkish)",
    addMetric: isTurkish ? "Metrik ekle" : "Add metric",
    addLevel: isTurkish ? "C4 seviyesi ekle" : "Add C4 level",
    addAdr: isTurkish ? "ADR ekle" : "Add ADR",
    addLog: isTurkish ? "Log girdisi ekle" : "Add log entry",
    addDiagram: isTurkish ? "Diyagram ekle" : "Add diagram",
    addGallery: isTurkish ? "Galeri öğesi ekle" : "Add gallery item",
    remove: isTurkish ? "Kaldır" : "Remove",
    cancel: isTurkish ? "İptal" : "Cancel",
    save: isTurkish ? "Dosyayı kaydet" : "Save dossier",
    noRows: isTurkish ? "Henüz kayıt eklenmedi." : "No entries yet.",
  };

  const update = (change: (current: DossierFormValues) => DossierFormValues) => {
    setValues((current) => change(current));
  };

  const updateMetric = (index: number, field: keyof DossierMetricForm, value: string) =>
    update((current) => ({
      ...current,
      metrics: current.metrics.map((metric, metricIndex) =>
        metricIndex === index ? { ...metric, [field]: field === "displayOrder" ? Number(value) || 0 : value } : metric,
      ),
    }));

  const addMetric = () =>
    update((current) => ({
      ...current,
      metrics: [
        ...current.metrics,
        { value: "", numericValue: "", label: "", note: "", displayOrder: current.metrics.length },
      ],
    }));

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={copy.impactEn}>
        <textarea
          aria-label={copy.impactEn}
          value={values.impactEn}
          onChange={(event) => update((current) => ({ ...current, impactEn: event.target.value }))}
          className={`${inputClassName} min-h-32`}
          rows={5}
        />
      </Field>
      <Field label={copy.impactTr}>
        <textarea
          aria-label={copy.impactTr}
          value={values.impactTr}
          onChange={(event) => update((current) => ({ ...current, impactTr: event.target.value }))}
          className={`${inputClassName} min-h-32`}
          rows={5}
        />
      </Field>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-4">
      {values.metrics.length === 0 && <p className="text-sm text-gray-500 dark:text-dark-400">{copy.noRows}</p>}
      {values.metrics.map((metric, index) => (
        <div key={`metric-${index}`} className="rounded-xl border border-gray-200 p-4 dark:border-dark-700">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={`Metric label ${index + 1}`}>
              <input className={inputClassName} value={metric.label} onChange={(event) => updateMetric(index, "label", event.target.value)} />
            </Field>
            <Field label={`Metric value ${index + 1}`}>
              <input className={inputClassName} value={metric.value} onChange={(event) => updateMetric(index, "value", event.target.value)} />
            </Field>
            <Field label={`Metric numeric value ${index + 1}`}>
              <input className={inputClassName} value={metric.numericValue} onChange={(event) => updateMetric(index, "numericValue", event.target.value)} />
            </Field>
            <Field label={`Metric note ${index + 1}`}>
              <input className={inputClassName} value={metric.note} onChange={(event) => updateMetric(index, "note", event.target.value)} />
            </Field>
          </div>
          <AddRemoveRow
            onAdd={addMetric}
            onRemove={() => update((current) => ({ ...current, metrics: current.metrics.filter((_, metricIndex) => metricIndex !== index) }))}
            addLabel={copy.addMetric}
            removeLabel={copy.remove}
          />
        </div>
      ))}
      {values.metrics.length === 0 && <AddRemoveRow onAdd={addMetric} addLabel={copy.addMetric} />}
    </div>
  );

  const renderC4 = () => (
    <div className="space-y-4">
      {values.c4.map((level, levelIndex) => (
        <div key={`c4-level-${levelIndex}`} className="rounded-xl border border-gray-200 p-4 dark:border-dark-700">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={`C4 level label ${levelIndex + 1}`}>
              <input className={inputClassName} value={level.label} onChange={(event) => update((current) => ({ ...current, c4: current.c4.map((item, index) => index === levelIndex ? { ...item, label: event.target.value } : item) }))} />
            </Field>
            <Field label={`C4 level note ${levelIndex + 1}`}>
              <input className={inputClassName} value={level.note} onChange={(event) => update((current) => ({ ...current, c4: current.c4.map((item, index) => index === levelIndex ? { ...item, note: event.target.value } : item) }))} />
            </Field>
          </div>
          {level.tiers.map((tier, tierIndex) => (
            <div key={`c4-tier-${levelIndex}-${tierIndex}`} className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-dark-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-400">Tier {tierIndex + 1}</p>
              {tier.map((node, nodeIndex) => (
                <div key={`c4-node-${levelIndex}-${tierIndex}-${nodeIndex}`} className="mt-3 grid gap-3 md:grid-cols-4">
                  <Field label={`C4 node kind ${levelIndex + 1}.${tierIndex + 1}.${nodeIndex + 1}`}>
                    <select className={inputClassName} value={node.kind} onChange={(event) => update((current) => ({ ...current, c4: current.c4.map((item, index) => index !== levelIndex ? item : { ...item, tiers: item.tiers.map((nodes, currentTier) => currentTier !== tierIndex ? nodes : nodes.map((currentNode, currentNodeIndex) => currentNodeIndex === nodeIndex ? { ...currentNode, kind: event.target.value as C4NodeKind } : currentNode)) }) }))}>
                      {(["person", "system", "client", "container", "component", "store", "queue", "external"] as C4NodeKind[]).map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                    </select>
                  </Field>
                  <Field label={`C4 node title ${levelIndex + 1}.${tierIndex + 1}.${nodeIndex + 1}`}>
                    <input className={inputClassName} value={node.title} onChange={(event) => update((current) => ({ ...current, c4: current.c4.map((item, index) => index !== levelIndex ? item : { ...item, tiers: item.tiers.map((nodes, currentTier) => currentTier !== tierIndex ? nodes : nodes.map((currentNode, currentNodeIndex) => currentNodeIndex === nodeIndex ? { ...currentNode, title: event.target.value } : currentNode)) }) }))} />
                  </Field>
                  <Field label={`C4 node sub ${levelIndex + 1}.${tierIndex + 1}.${nodeIndex + 1}`}>
                    <input className={inputClassName} value={node.sub} onChange={(event) => update((current) => ({ ...current, c4: current.c4.map((item, index) => index !== levelIndex ? item : { ...item, tiers: item.tiers.map((nodes, currentTier) => currentTier !== tierIndex ? nodes : nodes.map((currentNode, currentNodeIndex) => currentNodeIndex === nodeIndex ? { ...currentNode, sub: event.target.value } : currentNode)) }) }))} />
                  </Field>
                  <label className="flex items-center gap-2 pt-7 text-sm text-gray-700 dark:text-dark-200">
                    <input type="checkbox" checked={node.leaf} onChange={(event) => update((current) => ({ ...current, c4: current.c4.map((item, index) => index !== levelIndex ? item : { ...item, tiers: item.tiers.map((nodes, currentTier) => currentTier !== tierIndex ? nodes : nodes.map((currentNode, currentNodeIndex) => currentNodeIndex === nodeIndex ? { ...currentNode, leaf: event.target.checked } : currentNode)) }) }))} />
                    Leaf node
                  </label>
                </div>
              ))}
              <AddRemoveRow
                onAdd={() => update((current) => ({ ...current, c4: current.c4.map((item, index) => index !== levelIndex ? item : { ...item, tiers: item.tiers.map((nodes, currentTier) => currentTier !== tierIndex ? nodes : [...nodes, emptyC4Node()]) }) }))}
                addLabel="Add node"
              />
            </div>
          ))}
          <AddRemoveRow
            onAdd={() => update((current) => ({ ...current, c4: current.c4.map((item, index) => index !== levelIndex ? item : { ...item, tiers: [...item.tiers, [emptyC4Node()]] }) }))}
            onRemove={() => update((current) => ({ ...current, c4: current.c4.filter((_, index) => index !== levelIndex) }))}
            addLabel="Add tier"
            removeLabel={copy.remove}
          />
        </div>
      ))}
      <AddRemoveRow onAdd={() => update((current) => ({ ...current, c4: [...current.c4, emptyC4Level()] }))} addLabel={copy.addLevel} />
    </div>
  );

  const renderAdrs = () => (
    <div className="space-y-4">
      {values.adrs.map((adr, index) => (
        <div key={adr.id} className="rounded-xl border border-gray-200 p-4 dark:border-dark-700">
          <div className="grid gap-3 md:grid-cols-3">
            {(["id", "title", "status", "date"] as const).map((field) => (
              <Field key={field} label={`ADR ${field} ${index + 1}`}>
                <input className={inputClassName} value={adr[field]} onChange={(event) => update((current) => ({ ...current, adrs: current.adrs.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: event.target.value } : item) }))} />
              </Field>
            ))}
          </div>
          {(["context", "decision", "tradeoff"] as const).map((field) => (
            <Field key={field} label={`ADR ${field} ${index + 1}`}>
              <textarea className={`${inputClassName} min-h-24`} value={adr[field]} onChange={(event) => update((current) => ({ ...current, adrs: current.adrs.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: event.target.value } : item) }))} rows={3} />
            </Field>
          ))}
          <AddRemoveRow onAdd={() => update((current) => ({ ...current, adrs: [...current.adrs, { id: newIdentifier("adr"), title: "", status: "accepted", date: "", context: "", decision: "", tradeoff: "", displayOrder: current.adrs.length }] }))} onRemove={() => update((current) => ({ ...current, adrs: current.adrs.filter((_, itemIndex) => itemIndex !== index) }))} addLabel={copy.addAdr} removeLabel={copy.remove} />
        </div>
      ))}
      {values.adrs.length === 0 && <AddRemoveRow onAdd={() => update((current) => ({ ...current, adrs: [{ id: newIdentifier("adr"), title: "", status: "accepted", date: "", context: "", decision: "", tradeoff: "", displayOrder: 0 }] }))} addLabel={copy.addAdr} />}
    </div>
  );

  const renderLog = () => (
    <div className="space-y-4">
      {values.log.map((entry, index) => (
        <div key={entry.hash} className="rounded-xl border border-gray-200 p-4 dark:border-dark-700">
          <div className="grid gap-3 md:grid-cols-4">
            {(["hash", "tag", "date", "title"] as const).map((field) => (
              <Field key={field} label={`Log ${field} ${index + 1}`}>
                <input className={inputClassName} value={entry[field]} onChange={(event) => update((current) => ({ ...current, log: current.log.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: event.target.value } : item) }))} />
              </Field>
            ))}
          </div>
          <Field label={`Log note ${index + 1}`}>
            <textarea className={`${inputClassName} min-h-20`} value={entry.note} onChange={(event) => update((current) => ({ ...current, log: current.log.map((item, itemIndex) => itemIndex === index ? { ...item, note: event.target.value } : item) }))} rows={2} />
          </Field>
          <AddRemoveRow onAdd={() => update((current) => ({ ...current, log: [...current.log, { hash: newIdentifier("commit"), tag: "feat", date: "", title: "", note: "", displayOrder: current.log.length }] }))} onRemove={() => update((current) => ({ ...current, log: current.log.filter((_, itemIndex) => itemIndex !== index) }))} addLabel={copy.addLog} removeLabel={copy.remove} />
        </div>
      ))}
      {values.log.length === 0 && <AddRemoveRow onAdd={() => update((current) => ({ ...current, log: [{ hash: newIdentifier("commit"), tag: "feat", date: "", title: "", note: "", displayOrder: 0 }] }))} addLabel={copy.addLog} />}
    </div>
  );

  const updateDiagram = (index: number, change: (diagram: DossierDiagramForm) => DossierDiagramForm) =>
    update((current) => ({ ...current, diagrams: current.diagrams.map((diagram, diagramIndex) => diagramIndex === index ? change(diagram) : diagram) }));

  const renderDiagramData = (diagram: DossierDiagramForm, index: number) => {
    if (diagram.data.kind === "sequence") {
      return (
        <div className="space-y-3">
          <Field label={`Sequence actors ${index + 1}`}>
            <input className={inputClassName} value={diagram.data.actors.join(", ")} onChange={(event) => updateDiagram(index, (item) => ({ ...item, data: { ...item.data, actors: event.target.value.split(",").map((actor) => actor.trim()) } }))} />
          </Field>
          {diagram.data.messages.map((message, messageIndex) => (
            <div key={`message-${index}-${messageIndex}`} className="grid gap-3 md:grid-cols-4">
              {(["from", "to", "label"] as const).map((field) => <Field key={field} label={`Message ${field} ${messageIndex + 1}`}><input className={inputClassName} value={message[field]} onChange={(event) => updateDiagram(index, (item) => item.data.kind !== "sequence" ? item : ({ ...item, data: { ...item.data, messages: item.data.messages.map((currentMessage, currentIndex) => currentIndex === messageIndex ? { ...currentMessage, [field]: event.target.value } : currentMessage) } }))} /></Field>)}
              <Field label={`Message kind ${messageIndex + 1}`}><select className={inputClassName} value={message.kind} onChange={(event) => updateDiagram(index, (item) => item.data.kind !== "sequence" ? item : ({ ...item, data: { ...item.data, messages: item.data.messages.map((currentMessage, currentIndex) => currentIndex === messageIndex ? { ...currentMessage, kind: event.target.value as "return" | "" } : currentMessage) } }))}><option value="">call</option><option value="return">return</option></select></Field>
            </div>
          ))}
          <AddRemoveRow onAdd={() => updateDiagram(index, (item) => item.data.kind !== "sequence" ? item : ({ ...item, data: { ...item.data, messages: [...item.data.messages, { from: "", to: "", label: "", kind: "" }] } }))} addLabel="Add message" />
        </div>
      );
    }
    if (diagram.data.kind === "schema") {
      return <Field label={`Schema entities ${index + 1}`}><input className={inputClassName} value={diagram.data.tiers.flat().map((entity) => entity.name).join(", ")} onChange={(event) => updateDiagram(index, (item) => item.data.kind !== "schema" ? item : ({ ...item, data: { ...item.data, tiers: [event.target.value.split(",").map((name) => ({ name: name.trim(), kind: "", rows: [] }))] } }))} /></Field>;
    }
    if (diagram.data.kind === "tiers") {
      return <Field label={`Flow nodes ${index + 1}`}><input className={inputClassName} value={diagram.data.tiers.flat().map((node) => node.title).join(", ")} onChange={(event) => updateDiagram(index, (item) => item.data.kind !== "tiers" ? item : ({ ...item, data: { ...item.data, tiers: [event.target.value.split(",").map((title) => ({ kind: "state", title: title.trim(), sub: "", via: "" }))] } }))} /></Field>;
    }
    if (diagram.data.kind === "matrix") {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`Matrix columns ${index + 1}`}><input className={inputClassName} value={diagram.data.cols.join(", ")} onChange={(event) => updateDiagram(index, (item) => item.data.kind !== "matrix" ? item : ({ ...item, data: { ...item.data, cols: event.target.value.split(",").map((col) => col.trim()) } }))} /></Field>
          <Field label={`Matrix rows ${index + 1}`}><input className={inputClassName} value={diagram.data.rows.map((row) => row.label).join(", ")} onChange={(event) => updateDiagram(index, (item) => item.data.kind !== "matrix" ? item : ({ ...item, data: { ...item.data, rows: event.target.value.split(",").map((label) => ({ label: label.trim(), cells: [] })) } }))} /></Field>
        </div>
      );
    }
    return <p className="text-sm text-gray-500 dark:text-dark-400">C4 diagram data is generated from the C4 editor.</p>;
  };

  const renderDiagrams = () => (
    <div className="space-y-4">
      {values.diagrams.map((diagram, index) => (
        <div key={diagram.id} className="rounded-xl border border-gray-200 p-4 dark:border-dark-700">
          <div className="grid gap-3 md:grid-cols-4">
            <Field label={`Diagram id ${index + 1}`}><input className={inputClassName} value={diagram.id} onChange={(event) => updateDiagram(index, (item) => ({ ...item, id: event.target.value }))} /></Field>
            <Field label={`Diagram title ${index + 1}`}><input className={inputClassName} value={diagram.title} onChange={(event) => updateDiagram(index, (item) => ({ ...item, title: event.target.value }))} /></Field>
            <Field label={`Diagram kind ${index + 1}`}>
              <select className={inputClassName} value={diagram.kind} onChange={(event) => { const kind = event.target.value as DiagramKind; updateDiagram(index, (item) => ({ ...item, kind, data: emptyDiagramData(kind) })); }}>
                {(["c4", "sequence", "schema", "tiers", "matrix"] as DiagramKind[]).map((kind) => <option key={kind} value={kind}>{kind}</option>)}
              </select>
            </Field>
            <Field label={`Diagram note ${index + 1}`}><input className={inputClassName} value={diagram.note} onChange={(event) => updateDiagram(index, (item) => ({ ...item, note: event.target.value }))} /></Field>
          </div>
          <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-dark-900/60">{renderDiagramData(diagram, index)}</div>
          <AddRemoveRow onAdd={() => update((current) => ({ ...current, diagrams: [...current.diagrams, emptyDiagram()] }))} onRemove={() => update((current) => ({ ...current, diagrams: current.diagrams.filter((_, itemIndex) => itemIndex !== index) }))} addLabel={copy.addDiagram} removeLabel={copy.remove} />
        </div>
      ))}
      {values.diagrams.length === 0 && <AddRemoveRow onAdd={() => update((current) => ({ ...current, diagrams: [emptyDiagram()] }))} addLabel={copy.addDiagram} />}
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-4">
      {values.gallery.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-dark-700">
          <div className="grid gap-3 md:grid-cols-4">
            {(["id", "src", "caption", "hint"] as const).map((field) => <Field key={field} label={`Gallery ${field} ${index + 1}`}><input className={inputClassName} value={item[field]} onChange={(event) => update((current) => ({ ...current, gallery: current.gallery.map((currentItem, itemIndex) => itemIndex === index ? { ...currentItem, [field]: event.target.value } : currentItem) }))} /></Field>)}
          </div>
          <AddRemoveRow onAdd={() => update((current) => ({ ...current, gallery: [...current.gallery, { id: newIdentifier("gallery"), src: "", caption: "", hint: "", displayOrder: current.gallery.length }] }))} onRemove={() => update((current) => ({ ...current, gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index) }))} addLabel={copy.addGallery} removeLabel={copy.remove} />
        </div>
      ))}
      {values.gallery.length === 0 && <AddRemoveRow onAdd={() => update((current) => ({ ...current, gallery: [{ id: newIdentifier("gallery"), src: "", caption: "", hint: "", displayOrder: 0 }] }))} addLabel={copy.addGallery} />}
    </div>
  );

  const sections: Array<[EditorSection, string]> = [
    ["overview", copy.overview],
    ["metrics", copy.metrics],
    ["c4", copy.c4],
    ["adrs", copy.adrs],
    ["log", copy.log],
    ["diagrams", copy.diagrams],
    ["gallery", copy.gallery],
  ];

  return (
    <form onSubmit={(event) => { event.preventDefault(); void onSubmit(values); }} className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-dark-700">
        {sections.map(([id, label]) => <button key={id} type="button" onClick={() => setSection(id)} className={`${secondaryButtonClassName} ${section === id ? "border-primary-500 text-primary-600 dark:text-primary-300" : ""}`}>{label}</button>)}
      </div>
      {section === "overview" && renderOverview()}
      {section === "metrics" && renderMetrics()}
      {section === "c4" && renderC4()}
      {section === "adrs" && renderAdrs()}
      {section === "log" && renderLog()}
      {section === "diagrams" && renderDiagrams()}
      {section === "gallery" && renderGallery()}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-dark-700">
        <button type="button" onClick={onCancel} disabled={loading} className={secondaryButtonClassName}>{copy.cancel}</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Saving..." : copy.save}</button>
      </div>
    </form>
  );
}
