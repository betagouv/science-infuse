import { ContentService } from "@/lib/h5p/services/ContentService";
import { H5PPlayerUI } from "@lumieducation/h5p-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default (props: { h5pContentId: string }) => {
    const contentService = useMemo(() => new ContentService(process.env.NEXT_PUBLIC_H5P_URL || ""), []);
    const [isLoading, setIsLoading] = useState(false);
    return (
        <>
            {isLoading && (
                <div className="w-full h-full w-min-h-[350px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement de l'interactif...</p>
                    </div>
                </div>)
            }
            <div className={`w-full h-full ${isLoading ? 'invisible' : 'visible'} `}>
                <H5PPlayerUI
                    contentId={props.h5pContentId}
                    loadContentCallback={async (contentId: string, contextId?: string, asUserId?: string, readOnlyState?: boolean) => {
                        return contentService.getPlay(contentId, contextId, asUserId, readOnlyState)
                    }}
                    onInitialized={() => {
                        setIsLoading(false)
                    }}
                />
            </div>
        </>
    )

    // const iframeRef = useRef<HTMLIFrameElement>(null);
    // const [isLoading, setIsLoading] = useState(false);
    // const [isResizing, setIsResizing] = useState(true);
    // useEffect(() => {
    //     const handleMessage = (event: MessageEvent) => {
    //         if (
    //             event.source === iframeRef.current?.contentWindow &&
    //             event.data &&
    //             event.data.type === 'setHeight' &&
    //             typeof event.data.height === 'number'
    //         ) {
    //             if (iframeRef.current) {
    //                 if (event.data.height > window.innerHeight) {
    //                     const ratio = window.innerHeight / event.data.height;
    //                     const containerWidth = iframeRef.current.parentElement?.offsetWidth || 0;
    //                     iframeRef.current.style.height = `${event.data.height * ratio}px`;
    //                     iframeRef.current.style.width = `${(containerWidth * ratio) - 60}px`;
    //                 } else {
    //                     iframeRef.current.style.height = `${event.data.height + 20}px`;
    //                 }
    //             }
    //             setIsLoading(false);
    //             setIsResizing(false);
    //         }
    //     };

    //     const timeout = setTimeout(() => {
    //         setIsResizing(false);
    //     }, 5000);

    //     window.addEventListener('message', handleMessage);
    //     return () => {
    //         window.removeEventListener('message', handleMessage);
    //         clearTimeout(timeout);
    //     };
    // }, []);
    // return (
    //     <div className="flex w-full items-center justify-center relative">
    //         {(isLoading || isResizing) && (
    //             <div className="w-full h-full absolute w-min-h-[350px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
    //                 <div className="text-center">
    //                     <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
    //                     <p className="text-gray-500">Chargement de l'interactif...</p>
    //                 </div>
    //             </div>
    //         )}
    //             <iframe
    //                 ref={iframeRef}
    //                 className={`w-full overflow-hidden ${isLoading || isResizing ? 'invisible' : 'visible'}`}                    src={props.h5pPublicUrl}
    //                 style={{ border: 'none', minHeight: '300px' }}
    //                 title="H5P Content"
    //             />
    //     </div>
    // )
}