'use client';

import React, { } from 'react';
import Snackbar from '@/course_editor/components/Snackbar';
import AdminWrapper from '../AdminWrapper';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import IndexFile from './IndexFile';


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
                        content: <p>Content of tab2</p>,
                        iconId: 'fr-icon-youtube-line',
                        label: 'Video Youtube'
                    },
                    {
                        content: <p>Content of tab3</p>,
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