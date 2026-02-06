'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { CircularProgress } from "@mui/material";
import { apiClient } from "@/lib/api-client";
import { ExportH5pResponse } from "@/types/api";
import H5PRenderer from '@/app/(main)/mediaViewers/H5PRenderer';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { createPortal } from 'react-dom';
import { useAlertToast } from '@/components/AlertToast';
import { Edit2, Trash2, Undo2, Redo2, MousePointer2, Square } from 'lucide-react';
import { ImageACompleterData } from '@/app/api/export/h5p/creation-requests/createImageACompleter';
import { ChunkWithScore, ChunkWithScoreUnion, s3ToPublicUrl } from '@/types/vectordb';

const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

// TypeScript interfaces
interface BBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    color: string;
}

interface DraggingState {
    index: number;
    startX: number;
    startY: number;
}

interface ResizingState {
    index: number;
    corner: number;
}

interface Point {
    x: number;
    y: number;
}

interface BoundingBoxAnnotatorProps {
    imageUrl: string;
    initialBoxes?: BBox[];
    onChange?: (boxes: BBox[]) => void;
}

const BoundingBoxAnnotator = ({ imageUrl, initialBoxes = [], onChange }: BoundingBoxAnnotatorProps) => {
    const [boxes, setBoxes] = useState<BBox[]>(initialBoxes);
    const [history, setHistory] = useState<BBox[][]>([initialBoxes]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const [currentBox, setCurrentBox] = useState<Partial<BBox> | null>(null);
    const [selectedBox, setSelectedBox] = useState<number | null>(null);
    const [dragging, setDragging] = useState<DraggingState | null>(null);
    const [resizing, setResizing] = useState<ResizingState | null>(null);
    const [editingLabel, setEditingLabel] = useState<number | null>(null);
    const [mode, setMode] = useState<'select' | 'draw'>('select');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    // Load image dimensions
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Add to history and notify parent
    const addToHistory = useCallback((newBoxes: BBox[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...newBoxes]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setBoxes(newBoxes);
        onChange?.(newBoxes);
    }, [history, historyIndex, onChange]);

    // Undo/Redo handlers
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const newBoxes = [...history[newIndex]];
            setBoxes(newBoxes);
            setSelectedBox(null);
            onChange?.(newBoxes);
        }
    }, [historyIndex, history, onChange]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const newBoxes = [...history[newIndex]];
            setBoxes(newBoxes);
            setSelectedBox(null);
            onChange?.(newBoxes);
        }
    }, [historyIndex, history, onChange]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history]);

    const getMousePos = (e: React.MouseEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = imageDimensions.width / rect.width;
        const scaleY = imageDimensions.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const pos = getMousePos(e);

        if (mode === 'draw') {
            setSelectedBox(null);
            setDrawing(true);
            setCurrentBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
            return;
        }

        // Check if clicking on a resize handle
        const resizeHandle = getResizeHandle(pos);
        if (resizeHandle) {
            setResizing(resizeHandle);
            return;
        }

        // Check if clicking on an existing box
        const clickedBox = boxes.findIndex(box =>
            pos.x >= Math.min(box.x1, box.x2) && pos.x <= Math.max(box.x1, box.x2) &&
            pos.y >= Math.min(box.y1, box.y2) && pos.y <= Math.max(box.y1, box.y2)
        );

        if (clickedBox !== -1) {
            setSelectedBox(clickedBox);
            setDragging({ index: clickedBox, startX: pos.x, startY: pos.y });
        } else {
            setSelectedBox(null);
        }
    };

    const getResizeHandle = (pos: Point): ResizingState | null => {
        if (selectedBox === null) return null;
        const box = boxes[selectedBox];
        const handles = getHandles(box);
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / imageDimensions.width;
        const threshold = 12 / scaleX;

        for (let i = 0; i < handles.length; i++) {
            const dist = Math.sqrt(Math.pow(pos.x - handles[i].x, 2) + Math.pow(pos.y - handles[i].y, 2));
            if (dist < threshold) {
                return { index: selectedBox, corner: i };
            }
        }
        return null;
    };

    const getHandles = (box: BBox): Point[] => {
        const x1 = Math.min(box.x1, box.x2);
        const y1 = Math.min(box.y1, box.y2);
        const x2 = Math.max(box.x1, box.x2);
        const y2 = Math.max(box.y1, box.y2);
        return [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 }
        ];
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const pos = getMousePos(e);

        if (drawing && currentBox) {
            setCurrentBox({ ...currentBox, x2: pos.x, y2: pos.y });
        } else if (dragging) {
            const dx = pos.x - dragging.startX;
            const dy = pos.y - dragging.startY;
            const box = boxes[dragging.index];
            const updated = [...boxes];
            updated[dragging.index] = {
                ...box,
                x1: box.x1 + dx,
                y1: box.y1 + dy,
                x2: box.x2 + dx,
                y2: box.y2 + dy
            };
            setBoxes(updated);
            setDragging({ ...dragging, startX: pos.x, startY: pos.y });
        } else if (resizing) {
            const updated = [...boxes];
            const box = updated[resizing.index];
            const handles = getHandles(box);
            handles[resizing.corner] = { x: pos.x, y: pos.y };

            updated[resizing.index] = {
                ...box,
                x1: Math.min(handles[0].x, handles[2].x),
                y1: Math.min(handles[0].y, handles[2].y),
                x2: Math.max(handles[0].x, handles[2].x),
                y2: Math.max(handles[0].y, handles[2].y)
            };
            setBoxes(updated);
        }
    };

    const handleMouseUp = () => {
        if (drawing && currentBox && currentBox.x1 !== undefined && currentBox.y1 !== undefined && currentBox.x2 !== undefined && currentBox.y2 !== undefined) {
            const width = Math.abs(currentBox.x2 - currentBox.x1);
            const height = Math.abs(currentBox.y2 - currentBox.y1);
            if (width > 5 && height > 5) {
                const newBox: BBox = {
                    x1: currentBox.x1,
                    y1: currentBox.y1,
                    x2: currentBox.x2,
                    y2: currentBox.y2,
                    label: `Object ${boxes.length + 1}`,
                    color: COLORS[boxes.length % COLORS.length]
                };
                const newBoxes = [...boxes, newBox];
                addToHistory(newBoxes);
                setSelectedBox(boxes.length);
                setMode('select');
            }
            setCurrentBox(null);
        }
        if (dragging) {
            addToHistory(boxes);
        }
        if (resizing) {
            addToHistory(boxes);
        }
        setDrawing(false);
        setDragging(null);
        setResizing(null);
    };

    const deleteBox = (index: number) => {
        const newBoxes = boxes.filter((_, i) => i !== index);
        addToHistory(newBoxes);
        setSelectedBox(null);
    };

    const updateLabel = (index: number, label: string) => {
        const updated = [...boxes];
        updated[index].label = label;
        addToHistory(updated);
    };

    const drawBoxes = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Draw all boxes
            const allBoxes: (BBox | Partial<BBox>)[] = [...boxes];
            if (currentBox && currentBox.x1 !== undefined && currentBox.y1 !== undefined && currentBox.x2 !== undefined && currentBox.y2 !== undefined) {
                allBoxes.push(currentBox as BBox);
            }
            
            allBoxes.forEach((box, i) => {
                if (!box || box.x1 === undefined || box.y1 === undefined || box.x2 === undefined || box.y2 === undefined) return;
                
                const isSelected = i === selectedBox && !currentBox;
                const x1 = Math.min(box.x1, box.x2);
                const y1 = Math.min(box.y1, box.y2);
                const width = Math.abs(box.x2 - box.x1);
                const height = Math.abs(box.y2 - box.y1);

                ctx.strokeStyle = box.color || COLORS[i % COLORS.length];
                ctx.lineWidth = isSelected ? 4 : 3;
                ctx.strokeRect(x1, y1, width, height);

                if (box.label) {
                    ctx.fillStyle = box.color || COLORS[i % COLORS.length];
                    ctx.font = 'bold 18px sans-serif';
                    const textWidth = ctx.measureText(box.label).width;
                    const padding = 12;
                    const labelHeight = 28;
                    ctx.fillRect(x1, y1 - labelHeight, textWidth + padding * 2, labelHeight);
                    ctx.fillStyle = 'white';
                    ctx.fillText(box.label, x1 + padding, y1 - 8);
                }

                // Draw resize handles for selected box
                if (isSelected && box.x1 !== undefined && box.y1 !== undefined && box.x2 !== undefined && box.y2 !== undefined) {
                    const fullBox: BBox = box as BBox;
                    const handles = getHandles(fullBox);
                    ctx.fillStyle = fullBox.color || COLORS[i % COLORS.length];
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    handles.forEach(handle => {
                        // Draw white border first
                        ctx.fillStyle = 'white';
                        ctx.fillRect(handle.x - 10, handle.y - 10, 20, 20);
                        // Draw colored center
                        ctx.fillStyle = fullBox.color || COLORS[i % COLORS.length];
                        ctx.fillRect(handle.x - 8, handle.y - 8, 16, 16);
                    });
                }
            });
        };
        img.src = imageUrl;
    };

    useEffect(() => {
        drawBoxes();
    }, [boxes, currentBox, selectedBox, imageUrl]);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b p-4 shadow-sm">
                <div className="flex items-center justify-between max-w-12xl mx-auto gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Bounding Box Annotator</h1>

                    <div className="flex items-center gap-4">
                        {/* Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setMode('select')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${mode === 'select'
                                        ? 'bg-white shadow-sm text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <MousePointer2 size={18} />
                                Select
                            </button>
                            <button
                                onClick={() => setMode('draw')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${mode === 'draw'
                                        ? 'bg-white shadow-sm text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Square size={18} />
                                Draw
                            </button>
                        </div>

                        {/* Undo/Redo */}
                        <div className="flex gap-1">
                            <button
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 size={20} />
                            </button>
                            <button
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full object-contain"
                        style={{
                            cursor: mode === 'draw' ? 'crosshair'
                                : drawing ? 'crosshair'
                                    : dragging ? 'move'
                                        : resizing ? 'nwse-resize'
                                            : 'default'
                        }}
                    />
                </div>

                <div className="w-80 bg-white border-l overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">
                            Bounding Boxes ({boxes.length})
                        </h2>
                        <div className="space-y-2">
                            {boxes.map((box, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition ${selectedBox === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedBox(i)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: box.color }}
                                            />
                                            {editingLabel === i ? (
                                                <input
                                                    type="text"
                                                    value={box.label}
                                                    onChange={(e) => updateLabel(i, e.target.value)}
                                                    onBlur={() => setEditingLabel(null)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setEditingLabel(null)}
                                                    className="px-2 py-1 border rounded text-sm flex-1"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-medium text-sm">{box.label}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingLabel(i);
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBox(i);
                                                }}
                                                className="p-1 hover:bg-red-100 text-red-600 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        ({Math.round(Math.min(box.x1, box.x2))}, {Math.round(Math.min(box.y1, box.y2))}) →
                                        ({Math.round(Math.max(box.x1, box.x2))}, {Math.round(Math.max(box.y1, box.y2))})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-t p-3 text-sm text-gray-600">
                <div className="max-w-7xl mx-auto flex gap-6 items-center">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${mode === 'draw' ? 'bg-blue-100 text-blue-700 font-medium' : ''
                        }`}>
                        <span>{mode === 'draw' ? 'Draw mode: Click and drag to create boxes' : 'Select mode: Click boxes to select, drag to move'}</span>
                    </div>
                    <span>Drag corners to resize</span>
                    <span>Ctrl+Z/Y to undo/redo</span>
                </div>
            </div>
        </div>
    );
};

const modal = createModal({
    id: "modal-quit-page-without-saving",
    isOpenedByDefault: false
});

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
    const imageUrl = s3ToPublicUrl((chunk as ChunkWithScore<"pdf_image">).metadata.s3ObjectName);

    // Load image to get dimensions
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const convertToBoxFormat = (items: ImageACompleterBox[], dimensions: { width: number; height: number }): BBox[] => {
        return items.map((item, index) => {
            // Check if coordinates are normalized (0-1) or pixel values
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
                // Store as normalized coordinates for consistency
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

    // Wait for image dimensions before rendering
    if (!imageDimensions) {
        return <div className="flex items-center justify-center p-8">Loading image...</div>;
    }

    return (
        <BoundingBoxAnnotator
            imageUrl={imageUrl}
            initialBoxes={convertToBoxFormat(initialItems, imageDimensions)}
            onChange={handleBoxChange}
        />
    );
};

//////////////////////////////
// Main ImageACompleter Manager   //
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

    const updateImageACompleter = useCallback(async (chunkId: string, boxes: ImageACompleterBox[]) => {
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
    }, [h5pContentId, chunk, onH5PGenerated]);


    const generateImageACompleter = useCallback(async () => {
        setProcessingDone(false);
        setIsLoading(true);
        setImagesACompleter([]);

        // Stop parent loading indicator since we're showing our own
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
                // handleQuitWithoutSave();
                console.log("ERROR GENERATING FLASHCARDS", error);
                return;
            }

            if (!imageACompleterData) return;

            setImagesACompleter(imageACompleterData);

            await updateImageACompleter(chunkId, imageACompleterData,);
        } finally {
            setIsLoading(false);
            setProcessingDone(true);
        }
    }, [chunkId, updateImageACompleter, onDocumentProcessingEnd, alertToast]);


    useEffect(() => {
        if (chunkId && isInitialLoad.current) {
            isInitialLoad.current = false;
            generateImageACompleter();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chunkId]);

    return (
        <>
            {!hideBackButton && (
                document.getElementById("imageACompleter-back-portal") ? createPortal(
                    <Button
                        className='flex justify-center self-start items-center gap-2 md:absolute relative mb-4'
                        priority='secondary'
                        onClick={() => modal.open()}
                    >
                        {/* SVG */}
                        Retour
                    </Button>,
                    document.getElementById("imageACompleter-back-portal") as HTMLElement
                ) : (
                    <Button
                        className='flex justify-center self-start items-center gap-2 xl:absolute xl:translate-x-[calc(-100%-2rem)] translate-x-0 relative'
                        priority='secondary'
                        onClick={() => modal.open()}
                    >
                        {/* SVG */}
                        Retour
                    </Button>
                )
            )}

            <div className="w-full relative flex flex-col gap-8">
                <modal.Component title="">
                    <div className="flex flex-col gap-4">
                        <p>Attention, certaines modifications n'ont pas été enregistrées.</p>
                    </div>
                </modal.Component>

                {isLoading && <CircularProgress />}

                {processingDone && <p>Analyse terminée ! Voici une suggestion pour faciliter l'apprentissage :</p>}

                {h5pContentId && <H5PRenderer key={refreshKey} h5pContentId={h5pContentId} />}

                {processingDone && editContentActive && imagesACompleter && (
                    <ImageACompleterEditor
                        initialItems={imagesACompleter}
                        onChange={(updated) => {
                            setImagesACompleter(updated);
                            updateImageACompleter(chunkId, updated);
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
