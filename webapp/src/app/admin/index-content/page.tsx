'use client';

import React, { } from 'react';
import Snackbar from '@/course_editor/components/Snackbar';
import AdminWrapper from '../AdminWrapper';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import IndexFile from './IndexFile';
import IndexUrls from './IndexUrls';
import IndexYoutubeVideos from './IndexYoutubeVideos';


const IndexContent = (props: {}) => {


    return (
        <AdminWrapper>

            <Tabs
                label="Name of the tabs system"
                onTabChange={function noRefCheck() { }}
                tabs={[
                    {
                        content: <IndexFile />,
                        iconId: 'fr-icon-file-text-line',
                        label: 'Fichier'
                    },
                    {
                        content: <IndexYoutubeVideos/>,
                        iconId: 'fr-icon-youtube-line',
                        label: 'Vidéos Youtube'
                    },
                    {
                        content: <IndexUrls />,
                        iconId: 'fr-icon-links-fill',
                        label: 'Site web'
                    }
                ]}
            />
            <Snackbar />
        </AdminWrapper>

    );
};


export default IndexContent;