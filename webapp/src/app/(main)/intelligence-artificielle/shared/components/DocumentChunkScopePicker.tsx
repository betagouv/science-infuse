"use client";

import { apiClient } from "@/lib/api-client";
import type { ChunkWithScoreUnion } from "@/types/vectordb";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import { useEffect, useMemo, useState } from "react";

export type GenerationSourceScope =
  | { mode: "document" }
  | { mode: "chunk"; chunkId: string };

type Props = {
  documentId: string;
  value: GenerationSourceScope;
  onChange: (value: GenerationSourceScope) => void;
  label?: string;
};

const makeChunkLabel = (chunk: ChunkWithScoreUnion, index: number) => {
  const title = chunk.title?.trim();
  const text = (chunk.text || "").replace(/\s+/g, " ").trim();
  const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text;
  const prefix = `Extrait ${index + 1}`;
  if (title) return `${prefix} — ${title}`;
  if (preview) return `${prefix} — ${preview}`;
  return `${prefix}`;
};

export function DocumentChunkScopePicker(props: Props) {
  const [chunks, setChunks] = useState<ChunkWithScoreUnion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const doc = await apiClient.getDocument(props.documentId);
        if (cancelled) return;
        setChunks((doc?.chunks || []) as unknown as ChunkWithScoreUnion[]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [props.documentId]);

  const chunkOptions = useMemo(() => {
    if (!chunks) return [];
    return chunks.map((c, i) => ({ value: c.id, label: makeChunkLabel(c, i) }));
  }, [chunks]);

  const currentChunkId = props.value.mode === "chunk" ? props.value.chunkId : "";

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="m-0 text-base text-left text-[#161616]">{props.label || "Source utilisée pour la génération"}</p>

      <SegmentedControl
        small
        legend=""
        className="w-full [&_.fr-segmented__elements]:w-full"
        segments={[
          {
            label: "Tout le document",
            nativeInputProps: {
              checked: props.value.mode === "document",
              onChange: () => props.onChange({ mode: "document" }),
            },
          },
          {
            label: "Choisir un extrait",
            nativeInputProps: {
              checked: props.value.mode === "chunk",
              onChange: () => {
                const fallback = chunkOptions[0]?.value;
                if (fallback) {
                  props.onChange({ mode: "chunk", chunkId: fallback });
                }
              },
            },
          },
        ]}
      />

      {props.value.mode === "chunk" && (
        <Select
          disabled={isLoading || chunkOptions.length === 0}
          label={isLoading ? "Chargement des extraits…" : "Extrait"}
          nativeSelectProps={{
            value: currentChunkId,
            onChange: (e) => props.onChange({ mode: "chunk", chunkId: e.target.value }),
          }}
          options={chunkOptions}
        />
      )}

      <p className="m-0 text-sm text-[#666]">
        Astuce : si votre document est long, choisir un extrait permet de cibler une section précise et d'éviter une génération trop générale.
      </p>
    </div>
  );
}

