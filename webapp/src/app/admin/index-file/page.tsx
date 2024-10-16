'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { s3ToPublicUrl } from '@/types/vectordb';
import { useEffect } from '@preact-signals/safe-react/react';
import { useDropzone } from 'react-dropzone';
import RenderImportedImage from '@/course_editor/components/CourseSettings/components/RenderImportedImage';
import ImportedFileSource from '@/course_editor/components/CourseSettings/components/ImportedFileSource';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { File as DbFile } from '@prisma/client';
import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from '@/course_editor/components/Snackbar';
import AdminWrapper from '../AdminWrapper';


const IndexFile = (props: {}) => {
    const { data: session } = useSession();
    const user = session?.user;

    const { showSnackbar } = useSnackbar();

    const [isUploading, setIsUploading] = useState(false);
    const [droppedFile, setDroppedFile] = useState<File | null>(null)
    const [source, setSource] = useState('');
    const [isIndexing, setIsIndexing] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const ref = useRef<HTMLDivElement>(null)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setDroppedFile(file);
        }
    }, []);


    useEffect(() => {
        if (user) {
            setSource(`${user.firstName} ${user.lastName}`)
        }
    }, [user])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'video/mp4': ['.mp4'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });


    useEffect(() => {
        if (!ref.current) return;
        if (!ref.current.parentElement) return;
        ref.current.parentElement.style.opacity = '0';
        setTimeout(() => {
            if (ref.current && ref.current.parentElement) {
                ref.current.parentElement.style.opacity = '1';
            }
        }, 0)
    }, [ref])

    const indexFile = async (file: File, author?: string) => {
        setIsUploading(true);
        setIsIndexing(true);
        setIsDisabled(true);
        try {
            const response = await apiClient.indexFile(file, author);
            return response;
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                showSnackbar(<p className="m-0">Ce fichier a déjà été indexé <a href={`/admin/inspect-document?documentId=${error.response.data.id}`} target='_blank'>source</a></p>, 'error')
            } else {
                console.error('Error uploading file for indexing:', error);
            }
        } finally {
            setIsUploading(false);
            setIsIndexing(false);
        }
    }

    return (
        <AdminWrapper>

            <div ref={ref} className="flex flex-col items-center gap-8 bg-[#f6f6f6] rounded-lg shadow-lg p-16 w-full">



                <div {...getRootProps()} className="flex flex-col w-full items-center gap-2 p-4 sm:p-6 rounded-lg"
                    style={{
                        ...(isDragActive ? { outline: '2px dashed #000091', outlineOffset: '-2px' } : {})
                    }}>
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-4">
                        <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-8 h-8" preserveAspectRatio="none">
                            <circle cx={16} cy={16} r={16} fill="#000091" /><g clip-path="url(#clip0_1380_35417)">  <path fill-rule="evenodd" clip-rule="evenodd" d="M21.9997 18V20H23.9997V21.3333H21.9997V23.3333H20.6663V21.3333H18.6663V20H20.6663V18H21.9997ZM22.005 10C22.3703 10 22.6663 10.2967 22.6663 10.662V16.8947C22.2381 16.7434 21.7872 16.6663 21.333 16.6667V11.3333H10.6663L10.667 20.6667L16.8617 14.4713C17.0989 14.2333 17.4762 14.2093 17.7417 14.4153L17.8037 14.472L20.1677 16.8387C19.1232 17.157 18.254 17.8882 17.7618 18.8629C17.2696 19.8376 17.1971 20.9712 17.561 22.0007L9.99434 22C9.62899 21.9996 9.33301 21.7034 9.33301 21.338V10.662C9.33555 10.2977 9.63005 10.0029 9.99434 10H22.005ZM13.333 12.6667C14.0694 12.6667 14.6663 13.2636 14.6663 14C14.6663 14.7364 14.0694 15.3333 13.333 15.3333C12.5966 15.3333 11.9997 14.7364 11.9997 14C11.9997 13.2636 12.5966 12.6667 13.333 12.6667Z" fill="white" /></g><defs>  <clipPath id="clip0_1380_35417">    <rect width={16} height={16} fill="white" transform="translate(8 8)" />  </clipPath></defs>
                        </svg>

                        <p className="m-0 text-lg font-medium text-center text-black">
                            {!isDragActive ? "ou glissez et déposez en une ici" : "Déposez le fichier ici"}
                        </p>
                        <p className="m-0 text-sm text-center text-[#757575]">
                            Formats possibles : jpg, png, pdf, mp4
                        </p>
                    </div>
                    {droppedFile && (
                        <div className="flex flex-col gap-4 w-full items-center">
                            <RenderImportedImage isUploading={isUploading}
                                file={droppedFile}
                                onRemove={() => {setDroppedFile(null); setIsDisabled(false)}} />
                            <ImportedFileSource source={source} setSource={setSource} />
                            <Button className="bg-black" onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {                                    
                                    await indexFile(droppedFile, source);
                                    showSnackbar(<p className="m-0">Fichié ajouté à la liste d'indexation : <a href="/admin/tasks-list" target='_blank' >voir</a></p>, 'success')
                                } catch (error) {
                                    showSnackbar(<p className="m-0">erreur : {JSON.stringify(error)}</p>, 'error')
                                }
                            }}
                                disabled={isDisabled}>
                                {isIndexing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Indexation en cours...
                                    </>
                                ) : (
                                    "Commencer l'indexation"
                                )}
                            </Button>
                        </div>

                    )}


                </div>

                <Snackbar />
            </div>
        </AdminWrapper>

    );
};


export default IndexFile;