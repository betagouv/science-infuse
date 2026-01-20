"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { useCallback, useMemo, useRef, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";

type Props = {
  accept: Accept;
  label?: string;
  hintText?: string;
  titleInputLabel?: string;
  submitLabel: string;
  onSubmit: (file: File, mediaName: string) => Promise<void>;
};

const acceptToInputAccept = (accept: Accept) => {
  const extensions = Object.values(accept).flatMap((v) => (Array.isArray(v) ? v : []));
  // Fallback to "*" when no extension is provided.
  return extensions.length ? extensions.join(",") : "*";
};

export default function FileUploadPicker(props: Props) {
  const [mediaName, setMediaName] = useState("");
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputAccept = useMemo(() => acceptToInputAccept(props.accept), [props.accept]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setDroppedFile(file);
    setMediaName(file.name);

    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: props.accept,
    multiple: false,
    noClick: true,
  });

  return (
    <div className="flex flex-col w-full items-center">
      <div className="w-full flex flex-col gap-8">
        <div
          {...getRootProps()}
          className="flex flex-col w-full items-center gap-8"
          style={{
            ...(isDragActive ? { outline: "2px dashed #000091", outlineOffset: "-2px" } : {}),
          }}
        >
          <div className="fr-upload-group w-full">
            <label className="fr-label" htmlFor="upload-id">
              {props.label || "Ajouter un fichier"}{" "}
              {props.hintText ? <span className="fr-hint-text">{props.hintText}</span> : null}
            </label>

            <div className="flex flex-col w-full gap-4">
              <div className="flex flex-row items-center">
                <input
                  ref={fileInputRef}
                  className="fr-upload"
                  aria-describedby="upload-id-messages"
                  type="file"
                  id="upload-id"
                  name="upload"
                  accept={inputAccept}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDroppedFile(e.target.files[0]);
                      setMediaName(e.target.files[0].name);
                    }
                  }}
                />
              </div>

              {droppedFile && (
                <div className="flex flex-row items-end justify-between gap-4">
                  <Input
                    label={props.titleInputLabel || "Titre"}
                    nativeInputProps={{
                      type: "text",
                      value: mediaName,
                      onChange: (e) => setMediaName(e.target.value),
                      placeholder: "Titre",
                    }}
                    className="flex-1 !m-0"
                  />

                  <Button
                    className="whitespace-nowrap"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await props.onSubmit(droppedFile, mediaName);
                    }}
                  >
                    {props.submitLabel}
                  </Button>
                </div>
              )}
            </div>

            <div className="fr-messages-group" id="upload-id-messages" aria-live="polite" />
          </div>
        </div>
      </div>
    </div>
  );
}

