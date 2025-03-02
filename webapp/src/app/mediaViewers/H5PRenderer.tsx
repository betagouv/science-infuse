import { useEffect, useRef, useState } from "react";

export default (props: {h5pPublicUrl: string}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleMessage = (event: { data: { type: string; height: any; }; }) => {
            console.log("handleMessage", event.data)
            if (
                event.data &&
                event.data.type === 'setHeight' &&
                typeof event.data.height === 'number'
            ) {
                if (iframeRef.current) {
                    iframeRef.current.style.height = `${event.data.height+50}px`;
                }
                setIsLoading(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <>
            {isLoading && (
                <div className="w-full min-h-[300px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement de l'interactif...</p>
                    </div>
                </div>
            )}
            <iframe
                ref={iframeRef}
                className={`w-full overflow-hidden ${isLoading ? 'hidden' : ''}`}
                src={props.h5pPublicUrl}
                style={{ border: 'none', minHeight: '300px' }}
                title="H5P Content"
            />
        </>
    )
}