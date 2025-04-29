'use client';

import React from 'react';

import ContentListComponent from './components/ContentListComponent';
import { ContentService } from './services/ContentService';
import Login from './components/Login';

const contentService = new ContentService(`${process.env.NEXT_PUBLIC_H5P_URL}/h5p`);

export default function Page() {
    const [loggedIn, setLoggedIn] = React.useState(false);

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">H5P NodeJs SPA Demo</h1>
                    <div className="m-2">
                        <Login
                            contentService={contentService}
                            onLoggedIn={() => setLoggedIn(true)}
                            onLoggedOut={() => setLoggedIn(false)}
                        />
                    </div>
                </div>

                {loggedIn ? (
                    <ContentListComponent
                        contentService={contentService}
                    />
                ) : (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 text-red-700">
                        Content is only visible to logged in users! Please
                        log in with the button on the top
                    </div>
                )}
            </div>
        </div>
    );
}
