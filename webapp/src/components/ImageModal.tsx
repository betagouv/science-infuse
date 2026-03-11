import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useState, useEffect } from "react";

const imageModal = createModal({
    id: "image-viewer-modal",
    isOpenedByDefault: false
});

interface DocumentData {
    imageUrl: string;
    title?: string;
    description?: string;
    credit?: string;
    source?: string;
    mediaName?: string;
}

export const ImageModal = () => {
    const isOpen = useIsModalOpen(imageModal);
    const [documentData, setDocumentData] = useState<DocumentData>({
        imageUrl: "",
    });

    useEffect(() => {
        if (isOpen) {
            const dataStr = sessionStorage.getItem('modalImageData');
            if (dataStr) {
                try {
                    const data = JSON.parse(dataStr);
                    setDocumentData(data);
                } catch (e) {
                    console.error('Error parsing modal image data:', e);
                }
            }
        }
    }, [isOpen]);

    return (
        <>
            <imageModal.Component 
                title="Aperçu de l'image"
                size="large"
            >
                <div className="flex flex-col items-center gap-6 max-h-[80vh] overflow-y-auto">
                    <div className="w-full max-w-4xl overflow-hidden rounded-lg">
                        <img 
                            src={documentData.imageUrl} 
                            alt={documentData.description || documentData.title || "Image"}
                            className="w-full h-full object-contain"
                            style={{ maxHeight: '60vh' }}
                        />
                    </div>
                    
                    <div className="w-full max-w-4xl text-left space-y-4 px-4">
                        {documentData.title && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Titre</h3>
                                <p className="text-sm text-gray-700">{documentData.title}</p>
                            </div>
                        )}
                        
                        {documentData.description && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Description</h3>
                                <p className="text-sm text-gray-700">{documentData.description}</p>
                            </div>
                        )}
                        
                        {documentData.credit && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Crédit</h3>
                                <p className="text-sm text-gray-700">{documentData.credit}</p>
                            </div>
                        )}
                        
                        {documentData.source && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Source</h3>
                                <p className="text-sm text-gray-700">{documentData.source}</p>
                            </div>
                        )}
                        
                        {documentData.mediaName && !documentData.title && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Nom du fichier</h3>
                                <p className="text-sm text-gray-700">{documentData.mediaName}</p>
                            </div>
                        )}
                    </div>
                </div>
            </imageModal.Component>
        </>
    );
};

export const openImageModal = () => {
    imageModal.open();
};

export default ImageModal;
