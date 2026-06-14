'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { apiClient } from "@/lib/api-client";
import { GeneratorLoading, type LoadingMessagesConfig } from '../shared/components';
import { ExportH5pResponse } from "@/types/api";
import H5PRenderer from '@/app/(main)/mediaViewers/H5PRenderer';
import { createPortal } from 'react-dom';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useAlertToast } from '@/components/AlertToast';
import { Edit2, Trash2, Undo2, Redo2, MousePointer2, Square } from 'lucide-react';
import { ImageACompleterData } from '@/app/api/export/h5p/creation-requests/createImageACompleter';
import { ChunkWithScore, ChunkWithScoreUnion, s3ToPublicUrl } from '@/types/vectordb';

const loadingMessages: LoadingMessagesConfig = {
    default: [
        "Analyse de l'image en cours...",
        "Détection des zones à compléter...",
        "Génération des labels...",
        "Création de l'interactif..."
    ]
};

const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const modal = createModal({
    id: "modal-quit-image-a-completer-without-saving",
    isOpenedByDefault: false
});

// TypeScript interfaces
interface BBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    color: string;
}

interface Point {
    x: number;
    y: number;
}

type ActionState =
    | { type: 'draw'; startX: number; startY: number }
    | { type: 'drag'; index: number; startX: number; startY: number; initialBox: BBox }
    | { type: 'resize'; index: number; corner: 'nw' | 'ne' | 'se' | 'sw'; initialBox: BBox };

interface BoundingBoxAnnotatorProps {
    imageUrl: string;
    initialBoxes?: BBox[];
    onChange?: (boxes: BBox[]) => void;
}

const BoundingBoxAnnotator = ({ imageUrl, initialBoxes = [], onChange }: BoundingBoxAnnotatorProps) => {
    const [boxes, setBoxes] = useState<BBox[]>(initialBoxes);
    const [history, setHistory] = useState<BBox[][]>([initialBoxes]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [currentBox, setCurrentBox] = useState<Partial<BBox> | null>(null);
    const [selectedBox, setSelectedBox] = useState<number | null>(null);
    const [editingLabel, setEditingLabel] = useState<number | null>(null);
    const [mode, setMode] = useState<'select' | 'draw'>('select');

    // Pointer actions (drawing, dragging, resizing)
    const [action, setAction] = useState<ActionState | null>(null);

    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Charger les dimensions réelles de l'image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Observer la taille du conteneur pour adapter l'overlay parfaitement
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ width, height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Calcul de la taille affichée de l'image (Object-fit: contain logic)
    let fittedWidth = 0;
    let fittedHeight = 0;
    if (imageDimensions.width > 0 && imageDimensions.height > 0 && containerSize.width > 0 && containerSize.height > 0) {
        const imageRatio = imageDimensions.width / imageDimensions.height;
        const containerRatio = containerSize.width / containerSize.height;
        if (imageRatio > containerRatio) {
            fittedWidth = containerSize.width;
            fittedHeight = containerSize.width / imageRatio;
        } else {
            fittedHeight = containerSize.height;
            fittedWidth = containerSize.height * imageRatio;
        }
    }

    const addToHistory = useCallback((newBoxes: BBox[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...newBoxes]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setBoxes(newBoxes);
        onChange?.(newBoxes);
    }, [history, historyIndex, onChange]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setBoxes([...history[newIndex]]);
            setSelectedBox(null);
            onChange?.(history[newIndex]);
        }
    }, [historyIndex, history, onChange]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setBoxes([...history[newIndex]]);
            setSelectedBox(null);
            onChange?.(history[newIndex]);
        }
    }, [historyIndex, history, onChange]);

    // Raccourcis clavier (Undo/Redo & Suppression)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBox !== null) {
                e.preventDefault();
                const newBoxes = boxes.filter((_, i) => i !== selectedBox);
                addToHistory(newBoxes);
                setSelectedBox(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedBox, boxes, addToHistory]);

    // Récupérer la position de la souris relative aux dimensions internes de l'image
    const getPos = useCallback((clientX: number, clientY: number): Point => {
        if (!overlayRef.current) return { x: 0, y: 0 };
        const rect = overlayRef.current.getBoundingClientRect();
        const displayX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const displayY = Math.max(0, Math.min(clientY - rect.top, rect.height));

        return {
            x: (displayX / rect.width) * imageDimensions.width,
            y: (displayY / rect.height) * imageDimensions.height,
        };
    }, [imageDimensions]);

    const normalizeBox = (box: Partial<BBox>): BBox => ({
        ...box,
        x1: Math.min(box.x1!, box.x2!),
        y1: Math.min(box.y1!, box.y2!),
        x2: Math.max(box.x1!, box.x2!),
        y2: Math.max(box.y1!, box.y2!),
    } as BBox);

    // Global Pointer Events pour une interaction fluide même en dehors de la zone
    useEffect(() => {
        if (!action) return;

        const handlePointerMove = (e: PointerEvent) => {
            const pos = getPos(e.clientX, e.clientY);

            if (action.type === 'draw' && currentBox) {
                setCurrentBox({ ...currentBox, x2: pos.x, y2: pos.y });
            } else if (action.type === 'drag') {
                const dx = pos.x - action.startX;
                const dy = pos.y - action.startY;
                const { initialBox } = action;
                const width = initialBox.x2 - initialBox.x1;
                const height = initialBox.y2 - initialBox.y1;

                let newX1 = initialBox.x1 + dx;
                let newY1 = initialBox.y1 + dy;
                let newX2 = initialBox.x2 + dx;
                let newY2 = initialBox.y2 + dy;

                // Contraintes de bordures
                if (newX1 < 0) { newX1 = 0; newX2 = width; }
                if (newY1 < 0) { newY1 = 0; newY2 = height; }
                if (newX2 > imageDimensions.width) { newX2 = imageDimensions.width; newX1 = imageDimensions.width - width; }
                if (newY2 > imageDimensions.height) { newY2 = imageDimensions.height; newY1 = imageDimensions.height - height; }

                const updated = [...boxes];
                updated[action.index] = { ...initialBox, x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
                setBoxes(updated);
            } else if (action.type === 'resize') {
                const updated = [...boxes];
                const box = { ...action.initialBox };

                if (action.corner === 'nw') { box.x1 = pos.x; box.y1 = pos.y; }
                if (action.corner === 'ne') { box.x2 = pos.x; box.y1 = pos.y; }
                if (action.corner === 'se') { box.x2 = pos.x; box.y2 = pos.y; }
                if (action.corner === 'sw') { box.x1 = pos.x; box.y2 = pos.y; }

                box.x1 = Math.max(0, Math.min(imageDimensions.width, box.x1));
                box.y1 = Math.max(0, Math.min(imageDimensions.height, box.y1));
                box.x2 = Math.max(0, Math.min(imageDimensions.width, box.x2));
                box.y2 = Math.max(0, Math.min(imageDimensions.height, box.y2));

                updated[action.index] = box;
                setBoxes(updated);
            }
        };

        const handlePointerUp = () => {
            if (action.type === 'draw' && currentBox && currentBox.x1 !== undefined && currentBox.x2 !== undefined) {
                const width = Math.abs(currentBox.x2 - currentBox.x1);
                const height = Math.abs(currentBox.y2! - currentBox.y1!);

                if (width > 10 && height > 10) {
                    const newBox: BBox = normalizeBox({
                        ...currentBox,
                        label: `Objet ${boxes.length + 1}`,
                        color: COLORS[boxes.length % COLORS.length]
                    });
                    const newBoxes = [...boxes, newBox];
                    addToHistory(newBoxes);
                    setSelectedBox(boxes.length);
                    setMode('select');
                }
                setCurrentBox(null);
            } else if (action.type === 'drag' || action.type === 'resize') {
                const updatedBoxes = [...boxes];
                updatedBoxes[action.index] = normalizeBox(updatedBoxes[action.index]);
                addToHistory(updatedBoxes);
            }
            setAction(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [action, boxes, currentBox, imageDimensions, getPos, addToHistory]);

    const handlePointerDownOverlay = (e: React.PointerEvent) => {
        if (e.button !== 0) return; // Seulement clic gauche
        const pos = getPos(e.clientX, e.clientY);
        if (mode === 'draw') {
            setSelectedBox(null);
            setCurrentBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
            setAction({ type: 'draw', startX: pos.x, startY: pos.y });
        } else {
            setSelectedBox(null);
        }
    };

    const handlePointerDownBox = (e: React.PointerEvent, index: number) => {
        if (e.button !== 0 || mode === 'draw') return;
        e.stopPropagation();
        setSelectedBox(index);
        const pos = getPos(e.clientX, e.clientY);
        setAction({ type: 'drag', index, startX: pos.x, startY: pos.y, initialBox: boxes[index] });
    };

    const handlePointerDownHandle = (e: React.PointerEvent, index: number, corner: Extract<ActionState, { type: 'resize' }>['corner']) => {
        if (e.button !== 0 || mode === 'draw') return;
        e.stopPropagation();
        setAction({ type: 'resize', index, corner, initialBox: boxes[index] });
    };

    const deleteBox = (index: number) => {
        const newBoxes = boxes.filter((_, i) => i !== index);
        addToHistory(newBoxes);
        if (selectedBox === index) setSelectedBox(null);
    };

    const updateLabel = (index: number, label: string) => {
        const updated = [...boxes];
        updated[index].label = label;
        addToHistory(updated);
    };

    const renderBox = (box: Partial<BBox>, index: number) => {
        const isCurrent = index === -1;
        const isSelected = index === selectedBox;
        const color = box.color || COLORS[(isCurrent ? boxes.length : index) % COLORS.length];

        const x1 = Math.min(box.x1!, box.x2!);
        const y1 = Math.min(box.y1!, box.y2!);
        const x2 = Math.max(box.x1!, box.x2!);
        const y2 = Math.max(box.y1!, box.y2!);

        const left = (x1 / imageDimensions.width) * 100 + '%';
        const top = (y1 / imageDimensions.height) * 100 + '%';
        const width = ((x2 - x1) / imageDimensions.width) * 100 + '%';
        const height = ((y2 - y1) / imageDimensions.height) * 100 + '%';

        // Gérer le cas où le titre dépasserait en haut (si moins de 28px depuis le bord)
        const topPx = (y1 / imageDimensions.height) * fittedHeight;
        const isTooCloseToTop = topPx < 28;

        return (
            <div
                key={isCurrent ? 'current' : index}
                className={`absolute ${isSelected ? 'z-20' : 'z-10 hover:z-20'}`}
                style={{
                    left, top, width, height,
                    border: `${isSelected ? 4 : 2}px solid ${color}`,
                    backgroundColor: isSelected ? `${color}4D` : `${color}26`, // 30% alpha (selected) vs 15% alpha
                    cursor: mode === 'draw' ? 'crosshair' : (isSelected ? 'move' : 'pointer'),
                    boxSizing: 'border-box'
                }}
                onPointerDown={isCurrent ? undefined : (e) => handlePointerDownBox(e, index)}
            >
                {/* Étiquette / Titre comme l'original */}
                {(box.label) && !isCurrent && (
                    <div
                        className={`absolute left-[-2px] whitespace-nowrap flex items-center px-2 py-1 rounded-sm shadow-sm`}
                        style={{
                            backgroundColor: color,
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            lineHeight: 1,
                            ...(isTooCloseToTop ? { top: '0' } : { bottom: '100%', marginBottom: '2px' })
                        }}
                    >
                        {box.label}
                    </div>
                )}

                {/* Poignées de redimensionnement reprenant le design original */}
                {isSelected && !isCurrent && (['nw', 'ne', 'se', 'sw'] as const).map((corner) => {
                    const positions = {
                        'nw': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
                        'ne': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
                        'se': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
                        'sw': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
                    };
                    const cursors = {
                        'nw': 'nwse-resize',
                        'ne': 'nesw-resize',
                        'se': 'nwse-resize',
                        'sw': 'nesw-resize',
                    };

                    return (
                        <div
                            key={corner}
                            className={`absolute w-3 h-3 bg-white border-[2px] shadow-sm ${positions[corner]}`}
                            style={{ 
                                borderColor: color, 
                                cursor: cursors[corner],
                                boxSizing: 'border-box'
                            }}
                            onPointerDown={(e) => handlePointerDownHandle(e, index, corner)}
                        >
                            <div className="w-full h-full" style={{ backgroundColor: color, opacity: 0.8 }} />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 border rounded-lg overflow-hidden">
            <div className="bg-white border-b p-4 shadow-sm z-30 relative">
                <div className="flex items-center justify-between mx-auto gap-4">
                    <h2 className="text-xl m-0 font-bold text-gray-800">Annotateur de zones</h2>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setMode('select')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${mode === 'select'
                                    ? 'bg-white shadow-sm text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <MousePointer2 size={18} />
                                Sélectionner
                            </button>
                            <button
                                onClick={() => setMode('draw')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${mode === 'draw'
                                    ? 'bg-white shadow-sm text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Square size={18} />
                                Dessiner
                            </button>
                        </div>

                        <div className="flex gap-1 border-l pl-4">
                            <button
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Annuler (Ctrl+Z)"
                            >
                                <Undo2 size={20} />
                            </button>
                            <button
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Rétablir (Ctrl+Y)"
                            >
                                <Redo2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden min-h-[500px]">
                <div
                    ref={containerRef}
                    className="flex-1 relative bg-gray-900 overflow-hidden p-4 flex items-center justify-center touch-none select-none"
                    style={{
                        cursor: mode === 'draw' ? 'crosshair' : 'default'
                    }}
                >
                    {imageDimensions.width > 0 && fittedWidth > 0 && (
                        <div
                            ref={overlayRef}
                            style={{ width: fittedWidth, height: fittedHeight }}
                            className="relative bg-white touch-none"
                            onPointerDown={handlePointerDownOverlay}
                        >
                            {/* Image de fond en lecture seule */}
                            <img
                                src={imageUrl}
                                className="w-full h-full block pointer-events-none"
                                draggable={false}
                                alt="Document à annoter"
                            />

                            {/* Rendu de toutes les zones */}
                            {boxes.map((box, i) => renderBox(box, i))}
                            {action?.type === 'draw' && currentBox && renderBox(currentBox, -1)}
                        </div>
                    )}
                </div>

                <div className="w-80 bg-white border-l overflow-y-auto z-20 flex flex-col">
                    <div className="p-4 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg m-0 font-semibold text-gray-800">
                                Zones ({boxes.length})
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {boxes.map((box, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition ${selectedBox === i ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedBox(i)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                            <div
                                                className="w-4 h-4 rounded shrink-0"
                                                style={{ backgroundColor: box.color }}
                                            />
                                            {editingLabel === i ? (
                                                <input
                                                    type="text"
                                                    value={box.label}
                                                    onChange={(e) => updateLabel(i, e.target.value)}
                                                    onBlur={() => setEditingLabel(null)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setEditingLabel(null)}
                                                    className="px-2 py-1 border border-blue-400 rounded text-sm w-full outline-none focus:ring-2 focus:ring-blue-100"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span 
                                                    className="font-medium text-sm truncate" 
                                                    title={box.label}
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingLabel(i);
                                                    }}
                                                >
                                                    {box.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingLabel(i);
                                                }}
                                                className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded transition"
                                                title="Modifier le nom"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBox(i);
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 rounded transition"
                                                title="Supprimer la zone"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {boxes.length === 0 && (
                                <div className="text-center p-6 text-gray-500 border-2 border-dashed rounded-lg bg-gray-50">
                                    Aucune zone créée.<br/>
                                    Passez en mode "Dessiner" pour commencer.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-t p-3 text-sm text-gray-600 z-30 relative">
                <div className="flex justify-between items-center px-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        {mode === 'draw' ? (
                            <><Square size={16} className="text-blue-600" /> Cliquez et glissez sur l'image pour créer une zone</>
                        ) : (
                            <><MousePointer2 size={16} className="text-blue-600" /> Cliquez sur une zone pour la déplacer ou double-cliquez sur son nom pour le modifier</>
                        )}
                    </div>
                    <div className="text-gray-500 flex gap-4">
                        <span><kbd className="bg-gray-100 border rounded px-1 font-mono text-xs">Suppr</kbd> pour supprimer</span>
                        <span><kbd className="bg-gray-100 border rounded px-1 font-mono text-xs">Ctrl+Z</kbd> pour annuler</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export interface ImageACompleterBox {
    label: string;
    bbox: {
        x1: number,
        y1: number,
        x2: number,
        y2: number,
    };
}

export const generateImagesACompleterData = async (params: { chunkId: string }): Promise<[Error | null, ImageACompleterBox[] | null]> => {
    try {
        const response = await apiClient.generateImageACompleter(params.chunkId);
        return [null, response];
    } catch (error) {
        return [error as Error, null];
    }
};

type ImageACompleterEditorProps = {
    initialItems: ImageACompleterBox[];
    onChange: (updated: ImageACompleterBox[]) => void;
    onSave: () => Promise<void>;
    chunk: ChunkWithScoreUnion;
};

const ImageACompleterEditor: React.FC<ImageACompleterEditorProps> = ({ initialItems, onChange, onSave, chunk }) => {
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const imageUrl = (() => {
        if (chunk.mediaType === "pdf_image" || chunk.mediaType === "image") {
            return s3ToPublicUrl((chunk as ChunkWithScore<"pdf_image" | "image">).metadata.s3ObjectName);
        }

        if (chunk.mediaType === "raw_image") {
            return (chunk as ChunkWithScore<"raw_image">).metadata.publicPath || chunk.document.publicPath || "";
        }

        return "";
    })();

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const convertToBoxFormat = (items: ImageACompleterBox[], dimensions: { width: number; height: number }): BBox[] => {
        return items.map((item, index) => {
            const isNormalized = item.bbox.x1 <= 1 && item.bbox.y1 <= 1 && item.bbox.x2 <= 1 && item.bbox.y2 <= 1;

            return {
                x1: isNormalized ? item.bbox.x1 * dimensions.width : item.bbox.x1,
                y1: isNormalized ? item.bbox.y1 * dimensions.height : item.bbox.y1,
                x2: isNormalized ? item.bbox.x2 * dimensions.width : item.bbox.x2,
                y2: isNormalized ? item.bbox.y2 * dimensions.height : item.bbox.y2,
                label: item.label,
                color: COLORS[index % COLORS.length]
            };
        });
    };

    const convertFromBoxFormat = (boxes: BBox[], dimensions: { width: number; height: number }): ImageACompleterBox[] => {
        return boxes.map(box => ({
            label: box.label,
            bbox: {
                x1: box.x1 / dimensions.width,
                y1: box.y1 / dimensions.height,
                x2: box.x2 / dimensions.width,
                y2: box.y2 / dimensions.height
            }
        }));
    };

    const handleBoxChange = (boxes: BBox[]) => {
        if (imageDimensions) {
            onChange(convertFromBoxFormat(boxes, imageDimensions));
        }
    };

    if (!imageDimensions) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border rounded-lg">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Chargement de l'image...</p>
            </div>
        );
    }

    return (
        <BoundingBoxAnnotator
            imageUrl={imageUrl}
            initialBoxes={convertToBoxFormat(initialItems, imageDimensions)}
            onChange={handleBoxChange}
        />
    );
};

const ImageACompleterEditorDebounced: React.FC<
    ImageACompleterEditorProps & {
        onDebouncedChange: (updated: ImageACompleterBox[]) => Promise<void>;
        registerFlushPendingChange: (flush: () => Promise<void>) => void;
    }
> = ({ onDebouncedChange, onChange, registerFlushPendingChange, ...rest }) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingChangeRef = useRef<ImageACompleterBox[] | null>(null);

    const handleChange = useCallback((updated: ImageACompleterBox[]) => {
        onChange(updated);
        pendingChangeRef.current = updated;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            pendingChangeRef.current = null;
            onDebouncedChange(updated);
        }, 800);
    }, [onChange, onDebouncedChange]);

    const flushPendingChange = useCallback(async () => {
        if (!pendingChangeRef.current) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        const pendingChange = pendingChangeRef.current;
        pendingChangeRef.current = null;
        await onDebouncedChange(pendingChange);
    }, [onDebouncedChange]);

    useEffect(() => {
        registerFlushPendingChange(flushPendingChange);
        return () => registerFlushPendingChange(async () => undefined);
    }, [flushPendingChange, registerFlushPendingChange]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return <ImageACompleterEditor {...rest} onChange={handleChange} />;
};

//////////////////////////////
// Main ImageACompleter Manager
//////////////////////////////

export default function ImageACompleterManager(props: {
    chunk: ChunkWithScoreUnion,
    onBackClicked?: () => void,
    onDocumentProcessingEnd?: () => void,
    hideBackButton?: boolean;
    onH5PGenerated?: (h5pId: string) => void;
}) {
    const { chunk, onDocumentProcessingEnd, hideBackButton = false, onH5PGenerated } = props;
    const chunkId = chunk.id;
    const [imagesACompleter, setImagesACompleter] = useState<ImageACompleterBox[] | undefined>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editContentActive, setEditContentActive] = useState(true);
    const [processingDone, setProcessingDone] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloadH5pUrl, setDownloadH5pUrl] = useState<string | null>(null);
    const [downloadHTMLUrl, setDownloadHTMLUrl] = useState<string | null>(null);
    const [h5pContentId, setH5pContentId] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const alertToast = useAlertToast();
    const isInitialLoad = useRef(true);
    const flushPendingSaveRef = useRef<() => Promise<void>>(async () => undefined);
    const latestSaveRef = useRef<Promise<void>>(Promise.resolve());

    const updateImageACompleter = useCallback((chunkId: string, boxes: ImageACompleterBox[]) => {
        const savePromise = (async () => {
            setIsSaving(true);
            try {
                const exportData: ImageACompleterData = {
                    boxes,
                    chunkId,
                }
                const data: ExportH5pResponse = await apiClient.exportH5p({
                    h5pContentId: h5pContentId,
                    type: 'image-a-completer',
                    data: exportData,
                    documentIds: chunk ? [chunk.document.id] : [],
                });

                if (data) {
                    setPreviewUrl(data.embedUrl);
                    setDownloadH5pUrl(data.downloadH5p);
                    setDownloadHTMLUrl(data.downloadHTML);
                    setH5pContentId(data.h5pContentId);
                    setRefreshKey(prev => prev + 1);
                    onH5PGenerated?.(data.h5pContentId);
                }
            } finally {
                setIsSaving(false);
            }
        })();

        latestSaveRef.current = savePromise;
        return savePromise;
    }, [h5pContentId, chunk, onH5PGenerated]);


    const generateImageACompleter = useCallback(async () => {
        setProcessingDone(false);
        setIsLoading(true);
        setImagesACompleter([]);

        onDocumentProcessingEnd && onDocumentProcessingEnd();

        try {
            if (!chunk) {
                console.warn("Chunk manquant");
                return;
            }

            const [error, imageACompleterData] = await generateImagesACompleterData({ chunkId: chunkId });

            if (error) {
                alertToast.error(
                    "Erreur",
                    `Le traitement a échoué`
                );
                console.log("ERROR GENERATING FLASHCARDS", error);
                return;
            }

            if (!imageACompleterData) return;

            setImagesACompleter(imageACompleterData);

            await updateImageACompleter(chunkId, imageACompleterData);
        } finally {
            setIsLoading(false);
            setProcessingDone(true);
        }
    }, [chunk, chunkId, updateImageACompleter, onDocumentProcessingEnd, alertToast]);


    useEffect(() => {
        if (chunkId && isInitialLoad.current) {
            isInitialLoad.current = false;
            generateImageACompleter();
        }
    }, [chunkId, generateImageACompleter]);

    const handleSaveAndQuit = async () => {
        modal.close();
        await flushPendingSaveRef.current();
        await latestSaveRef.current;
        props.onBackClicked && props.onBackClicked();
    };

    const handleQuitWithoutSave = () => {
        modal.close();
        props.onBackClicked && props.onBackClicked();
    };

    return (
        <>
            {!hideBackButton && (
                document.getElementById("imageACompleter-back-portal") ? createPortal(
                    <Button
                        className='flex justify-center self-start items-center gap-2 md:absolute relative mb-4'
                        priority='secondary'
                        onClick={() => modal.open()}
                        disabled={isSaving}
                    >
                        {isSaving ? "Enregistrement..." : "Retour"}
                    </Button>,
                    document.getElementById("imageACompleter-back-portal") as HTMLElement
                ) : (
                    <Button
                        className='flex justify-center self-start items-center gap-2 xl:absolute xl:translate-x-[calc(-100%-2rem)] translate-x-0 relative'
                        priority='secondary'
                        onClick={() => modal.open()}
                        disabled={isSaving}
                    >
                        {isSaving ? "Enregistrement..." : "Retour"}
                    </Button>
                )
            )}

            <div className="w-full relative flex flex-col gap-8">
                <modal.Component title="">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 items-center">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.5633 9.66673L9.41132 2.51473L11.2967 0.629395L21.6673 11.0001L11.2967 21.3707L9.41132 19.4854L16.5633 12.3334H0.333984V9.66673H16.5633Z" fill="#161616" />
                            </svg>
                            <p className="text-2xl m-0 font-bold text-left text-[#161616]">Quitter la page</p>
                        </div>
                        <p>Attention, certaines modifications n'ont pas été enregistrées.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="w-full justify-center sm:w-auto" onClick={handleSaveAndQuit}>
                                {isSaving ? "Enregistrement en cours" : "Enregistrer et quitter"}
                            </Button>
                            <Button className="w-full justify-center sm:w-auto" priority='secondary' onClick={handleQuitWithoutSave}>
                                Quitter sans enregistrer
                            </Button>
                        </div>
                    </div>
                </modal.Component>

                {isLoading && (
                    <GeneratorLoading
                        title="Création de l'image à compléter"
                        messageType="default"
                        loadingMessages={loadingMessages}
                    />
                )}

                {processingDone && <p>Analyse terminée ! Voici une suggestion pour faciliter l'apprentissage :</p>}

                {h5pContentId && <H5PRenderer key={refreshKey} h5pContentId={h5pContentId} />}

                <div className="flex flex-wrap items-center gap-4">
                    {processingDone && (
                        <>
                            {downloadHTMLUrl && (
                                <Button
                                    priority='secondary'
                                    className='flex gap-2 w-full justify-center sm:w-fit'
                                    onClick={() => window.open(downloadHTMLUrl, '_blank')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M2 12.6663H14V13.9997H2V12.6663ZM8.66667 8.78101L12.714 4.73301L13.6567 5.67567L8 11.333L2.34333 5.67634L3.286 4.73301L7.33333 8.77967V1.33301H8.66667V8.78101Z" fill="#000091" />
                                    </svg>
                                    <p className='m-0'>Télécharger en HTML</p>
                                </Button>
                            )}

                            {downloadH5pUrl && (
                                <Button
                                    priority='secondary'
                                    className='flex gap-2 w-full justify-center sm:w-fit'
                                    onClick={() => window.open(downloadH5pUrl, '_blank')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M2 12.6663H14V13.9997H2V12.6663ZM8.66667 8.78101L12.714 4.73301L13.6567 5.67567L8 11.333L2.34333 5.67634L3.286 4.73301L7.33333 8.77967V1.33301H8.66667V8.78101Z" fill="#000091" />
                                    </svg>
                                    <p className='m-0'>Télécharger en H5P</p>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {processingDone && editContentActive && imagesACompleter && (
                    <ImageACompleterEditorDebounced
                        initialItems={imagesACompleter}
                        onChange={(updated) => {
                            setImagesACompleter(updated);
                        }}
                        onDebouncedChange={(updated) => {
                            return updateImageACompleter(chunkId, updated);
                        }}
                        registerFlushPendingChange={(flush) => {
                            flushPendingSaveRef.current = flush;
                        }}
                        onSave={async () => {
                            await updateImageACompleter(chunkId, imagesACompleter);
                        }}
                        chunk={chunk}
                    />
                )}
            </div>
        </>
    );
}
