import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Button, Col, Dropdown, Row } from 'react-bootstrap';

import { ContentService } from '../services/ContentService';
import axios from 'axios';

interface LoginProps {
    contentService: ContentService;
    onLoggedIn: () => void;
    onLoggedOut: () => void;
}

const Login = ({ contentService, onLoggedIn, onLoggedOut }: LoginProps) => {
    const [loginData, setLoginData] = useState<{
        username: string;
        name: string;
        email: string;
        csrfToken: string;
    }>();
    const [loginMessage, setLoginMessage] = useState<string>();
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const logout = () => {
        fetch(`${process.env.NEXT_PUBLIC_H5P_URL}/logout`, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-type': 'application/json',
                'CSRF-Token': contentService.getCsrfToken() ?? ''
            },
            body: JSON.stringify({})
        })
            .then(() => {
                setLoginData(undefined);
                setLoginMessage(undefined);
                contentService.setCsrfToken(undefined);
                onLoggedOut();
            })
            .catch((reason) => {
                setLoginData(undefined);
                setLoginMessage(`Error logging out: ${reason}`);
                contentService.setCsrfToken(undefined);
                onLoggedOut();
            });
    };

    const validateToken = async (token?: string) => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_H5P_URL}/validate-token`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setCsrfToken(response.data.csrfToken);
            contentService.setCsrfToken(response.data.csrfToken);
            return response.data;
        } catch (error) {
            console.error('Failed to validate token with H5P server:', error);
            throw error;
        }
    };

    const authenticate = async () => {
        try {
            const response = await fetch(`/api/h5p/auth`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to get JWT from /api/h5p/auth:', response.status, errorText);
                throw new Error('Failed to initiate H5P session');
            }

            const data = await response.json();
            console.log("Received JWT from /api/h5p/auth:", data.token ? data.token.substring(0, 15) + '...' : 'undefined');
            if (!data.token) {
                throw new Error('No token received from authentication endpoint.');
            }

            contentService.setJwtToken(data.token);
            setToken(data.token);

            await validateToken(data.token);
            onLoggedIn();

            return true;
        } catch (error) {
            console.error('H5P authentication error:', error);
        }
    };

    return (
        <React.Fragment>
            {!loginData ? (
                <Button onClick={() => authenticate()}>LOGIN</Button>
            ) : (
                <Row className="align-items-center">
                    <Col>{loginData.name}</Col>
                    <Col>
                        <Button onClick={logout}>Logout</Button>
                    </Col>
                </Row>
            )}
            {loginMessage && (
                <Alert variant="error">{loginMessage}</Alert>
            )}
        </React.Fragment>
    );
};

export default Login;