import { dir, DirectoryResult } from 'tmp-promise';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import express, { Request, Response, NextFunction } from 'express'; // Added types
import fileUpload from 'express-fileupload';
import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';
import * as i18nextHttpMiddleware from 'i18next-http-middleware';
import path from 'path';
import fs from 'fs-extra';
import passport from 'passport';
// Removed LocalStrategy as it wasn't used in the login route provided
// import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import csurf from '@dr.pogodin/csurf';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

import {
    h5pAjaxExpressRouter,
    libraryAdministrationExpressRouter,
    contentTypeCacheExpressRouter
} from '@lumieducation/h5p-express';

import * as H5P from '@lumieducation/h5p-server';
import restExpressRoutes from './routes';
import ExampleUser from './ExampleUser';
import createH5PEditor from './createH5PEditor';
import { displayIps, clearTempFiles, checkAdaH5pSecret } from './utils';
import ExamplePermissionSystem from './ExamplePermissionSystem';
import H5PHtmlExporter from '@lumieducation/h5p-html-exporter';

// Extend Express Request type for custom properties
declare global {
    namespace Express {
        interface Request {
            isTrustedServerRequest?: boolean;
            csrfToken?: () => string; // Add type for csurf token function
            // t?: i18next.TFunction; // Add type for i18next function
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User extends ExampleUser { } // Make Express User compatible with ExampleUser
    }
}


let tmpDir: DirectoryResult;
const JWT_SECRET = process.env.H5P_JWT_SECRET;
if (!JWT_SECRET) {
    console.warn("WARN: H5P_JWT_SECRET is not set. JWT authentication will not work securely.");
}
if (!process.env.SESSION_SECRET) {
    console.warn("WARN: SESSION_SECRET is not set. Session security is compromised.");
}

const LIBRARIES_TO_INSTALL = ['H5P.InteractiveVideo', 'H5P.QuestionSet'];

// Marked async but doesn't use await - could be synchronous if installLibraryFromHub doesn't need setupLibraries context
async function installLibrary(id: string, user: H5P.IUser, h5pEditor: H5P.H5PEditor): Promise<boolean> {
    await h5pEditor.installLibraryFromHub(id, user);
    return true;
}

async function installLocalLibraries() {
    try {
        await fs.ensureDir('./h5p/libraries');
        await fs.ensureDir('./libraries');

        const libraryFolders = await fs.readdir('libraries_to_install');
        for (const folder of libraryFolders) {
            const sourcePath = path.join('libraries_to_install', folder);
            const h5pDestPath = path.join('./h5p/libraries', folder);
            const libDestPath = path.join('./libraries', folder);

            await fs.copy(sourcePath, h5pDestPath);
            await fs.copy(sourcePath, libDestPath);
        }

        console.log('Successfully copied library folders to target directories');
        return true;
    } catch (error) {
        console.error('Error copying library folders:', error);
        return false;
    }
}

async function setupLibraries(user: H5P.IUser, h5pEditor: H5P.H5PEditor): Promise<void> {    console.log("Attempting to install required libraries...");
    // Ensure a valid user object is passed, potentially an admin user created during setup.
    if (!user) {
        console.warn("Skipping library installation: An admin user is required.");
        return;
    }
    for (const id of LIBRARIES_TO_INSTALL) {
        try {
            console.log(`Installing library: ${id}`);
            await installLibrary(id, user, h5pEditor);
            console.log(`Successfully installed: ${id}`);
        } catch (error: any) {
            console.error(`Failed to install ${id}:`, error.message || error);
            // Check for specific errors, e.g., library already installed
            if (error.message && error.message.includes('already installed')) {
                console.log(`${id} is already installed.`);
            }
        }
    }
    await installLocalLibraries();
    console.log("Library installation check complete.");
}

const anonymousUser = new ExampleUser(
    'anonymous',
    'Anonymous',
    '',
    'anonymous'
);

const initPassport = (): void => {
    // Configure JWT strategy
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET || 'fallback-secret-for-dev-only', // Provide a fallback for safety
        passReqToCallback: true // Pass request object to callback
    };

    passport.use(
        new JwtStrategy(jwtOptions, (req: Request, jwtPayload: any, done: (error: any, user?: Express.User | false | null) => void) => {
            // We only verify JWT if it's NOT a trusted server request
            if (req.isTrustedServerRequest) {
                // Should not happen if logic is correct, but safeguard anyway
                return done(null, req.user); // Use user set by checkAdaH5pSecret
            }

            // Basic payload validation
            if (!jwtPayload || !jwtPayload.id || !jwtPayload.role) {
                console.warn('JWT verification failed: Invalid payload structure.');
                return done(null, false); // Indicate failure, but not an error
            }

            // Create ExampleUser from JWT payload
            const user = new ExampleUser(
                jwtPayload.id.toString(), // Ensure ID is string
                jwtPayload.name || 'Unnamed User', // Provide default name
                jwtPayload.email || '', // Provide default email
                jwtPayload.role // This should be 'admin', 'teacher', or 'student' ideally
            );

            return done(null, user as ExampleUser | null);
            ;
        })
    );

    // Note: Session-based serialization/deserialization might not be strictly
    // necessary if only using JWT, but keeping them doesn't hurt and might
    // be useful if session features are added later.
    passport.serializeUser((user, done): void => {
        // Serialize the whole user object for simplicity in this example
        done(null, user as ExampleUser | null);
        ;
    });

    passport.deserializeUser((user: ExampleUser, done): void => {
        // Deserialize back into an ExampleUser object
        // Add validation if needed (e.g., check if user still exists)
        done(null, user as ExampleUser | null);
        ;
    });
};


// Middleware to add CSRF token *value* to the user object if CSRF is active
const addCsrfTokenValueToUser = (req: Request, res: Response, next: NextFunction): void => {
    // Only attempt to add if CSRF is active for this request and user exists
    if (!req.isTrustedServerRequest && req.user && typeof req.csrfToken === 'function') {
        try {
            // Store the actual token value, not the function
            (req.user as any).csrfTokenValue = req.csrfToken();
        } catch (e) {
            console.error("Error getting/assigning CSRF token to user:", e);
            // Decide if this is critical. For now, log and continue.
        }
    }
    next();
};

// Middleware to handle authentication:
// 1. Check for trusted server token (AdaH5pSecret)
// 2. If not trusted, attempt JWT authentication via Passport
// 3. If neither, set anonymous user
const authenticateRequest = (req: Request, res: Response, next: NextFunction): void => {
    console.log('Starting authentication process for request');
    // 1. Check trusted server token
    if (checkAdaH5pSecret(req, res)) {
        console.log('Request authenticated as trusted server');
        req.isTrustedServerRequest = true;
        // User should be set within checkAdaH5pSecret, assuming it sets req.user to an admin-like ExampleUser
        if (!req.user) {
            console.error("CRITICAL: checkAdaH5pSecret returned true but did not set req.user!");
            // Fallback or error handling needed here. Using anonymous for now.
            req.user = anonymousUser;
            console.log('Fallback to anonymous user due to missing req.user');
        } else if (!(req.user instanceof ExampleUser)) {
            // Ensure the user set by checkAdaH5pSecret is an ExampleUser instance
            console.warn("User set by checkAdaH5pSecret is not an ExampleUser instance. Wrapping it.");
            console.log('Converting non-ExampleUser to ExampleUser instance');
            req.user = new ExampleUser(
                (req.user as any).id || (req.user as any).username || 'trusted_server',
                (req.user as any).name || 'Trusted Server',
                (req.user as any).email || '',
                (req.user as any).role || 'admin' // Assume admin role for trusted server
            );
            console.log('Successfully created ExampleUser instance for trusted server');
        }
        return next(); // Skip JWT/Passport
    }

    console.log('Request not authenticated as trusted server, proceeding with standard auth');
    // 2. Not a trusted server request, proceed with standard auth    req.isTrustedServerRequest = false;

    // Attempt JWT authentication using passport.authenticate
    // 'jwt' strategy will extract token and verify if present
    // 'session: false' because we handle user state via JWT, not server session for auth
    passport.authenticate('jwt', { session: false }, (err: any, user: Express.User | false | null, info: any) => {
        if (err) {
            console.error("Passport JWT authentication error:", err);
            return next(err); // Pass internal errors
        }
        if (!user) {
            // No valid JWT token found or verification failed
            // info might contain details like 'No auth token' or 'jwt expired'
            console.log(`JWT Auth Info: ${info?.message || info || 'No authentication info provided'}`);
            console.log('No valid user found, falling back to anonymous user');
            req.user = anonymousUser; // Fallback to anonymous user
        } else {
            console.log(`User authenticated successfully: ${user}`);
            // JWT valid, user object (ExampleUser) provided by JwtStrategy callback
            req.user = user as ExampleUser; // Assign authenticated user
        }
        next();
    })(req, res, next);
};
// CSRF Protection Middleware Wrapper
// Applies csurf only if the request is NOT identified as a trusted server request
const conditionalCsrfProtection = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isTrustedServerRequest) {
        // Skip CSRF protection for trusted requests
        return next();
    }
    // Apply CSRF protection for regular user requests
    csurf({
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'lax' // Recommended default
        },
        // Optional: customize how the token is retrieved if needed
        // value: (req) => req.headers['x-xsrf-token'] || req.body?._csrf || req.query?._csrf
    })(req, res, next);
};


const start = async (): Promise<void> => {
    const useTempUploads = process.env.TEMP_UPLOADS !== 'false';
    if (useTempUploads) {
        tmpDir = await dir({ keep: false, unsafeCleanup: true });
        console.log(`Using temporary directory for uploads: ${tmpDir.path}`);
    } else {
        console.log("Temporary directory for uploads disabled.");
    }

    // --- i18next Initialization ---
    const translationFunction = await i18next
        .use(i18nextFsBackend)
        .use(i18nextHttpMiddleware.LanguageDetector)
        .init({
            backend: {
                loadPath: path.join(
                    __dirname,
                    '../../../node_modules/@lumieducation/h5p-server/build/assets/translations/{{ns}}/{{lng}}.json'
                )
            },
            debug: !!(process.env.DEBUG && process.env.DEBUG.includes('i18n')),
            defaultNS: 'server',
            fallbackLng: 'en', // Changed default to 'en' as it's more common
            ns: [ /* ... namespaces ... */],
            preload: ['en', 'fr']
        });
    console.log("i18next initialized.");

    // --- H5P Configuration and Editor/Player Setup ---
    const config = await new H5P.H5PConfig(
        new H5P.fsImplementations.JsonStorage(path.resolve('config.json'))
    ).load();
    console.log("H5P config loaded.");

    const h5pUrl = process.env.NEXT_PUBLIC_H5P_URL || `http://localhost:${process.env.PORT || 8006}`;

    // UrlGenerator configured to add CSRF token *value* if available on user
    // @ts-ignore
    const urlGenerator = new H5P.UrlGenerator({ ...config, baseUrl: `${process.env.NEXT_PUBLIC_H5P_URL}/h5p` },
        {
            queryParamGenerator: (user) => {
                // Use the stored value from addCsrfTokenValueToUser
                if ((user as any)?.csrfTokenValue) {
                    return {
                        name: '_csrf',
                        value: (user as any).csrfTokenValue
                    };
                }
                return { name: '', value: '' }; // No token to add
            },
            protectAjax: true,
            protectContentUserData: true,
            protectSetFinished: true
        }
    );

    const permissionSystem = new ExamplePermissionSystem() as H5P.IPermissionSystem<H5P.IUser>;

    const h5pEditor: H5P.H5PEditor = await createH5PEditor(
        config,
        urlGenerator,
        permissionSystem,
        path.resolve('h5p/libraries'),
        path.resolve('h5p/content'),
        path.resolve('h5p/temporary-storage'),
        path.resolve('h5p/user-data'),
        (key, language) => translationFunction(key, { lng: language })
    );
    console.log("H5P Editor created.");

    h5pEditor.setRenderer((model) => model); // Simple renderer example

    const h5pPlayer = new H5P.H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config,
        undefined, // No cache assets manager specified
        urlGenerator,
        undefined, // No Content Storer specified
        { permissionSystem },
        h5pEditor.contentUserDataStorage // Use Content User Data Storage from Editor
    );
    console.log("H5P Player created.");

    h5pPlayer.setRenderer((model) => model); // Simple renderer example

    // --- Initial Library Installation (Run once, ideally needs an admin user) ---
    // This needs careful handling in production. Maybe a separate setup script.
    // For now, we'll try to run it with a temporary admin user.
    const tempAdminUser = new ExampleUser('setup_admin', 'Setup Admin', '', 'admin');
    try {
        await setupLibraries(tempAdminUser, h5pEditor);
    } catch (e: any) {
        console.error("Error during initial library setup:", e.message);
    }


    // --- Express Server Setup ---
    const server = express();

    // --- Core Middleware ---
    server.use(cors({
        origin: process.env.WEBAPP_URL, // Use VITE_URL if WEBAPP_URL is not set
        credentials: true
    }));
    server.use(bodyParser.json({ limit: '500mb' }));
    server.use(bodyParser.urlencoded({ extended: true, limit: '500mb' })); // Added limit here too
    server.use(cookieParser() as express.RequestHandler);

    // --- Authentication Middleware (AdaH5pSecret or JWT/Anonymous) ---
    // Placed early, after cookie/body parsing, before session/passport init that might depend on req.user
    server.use(authenticateRequest);

    // --- File Upload Middleware ---
    server.use(
        fileUpload({
            limits: { fileSize: config.maxTotalSize || 50 * 1024 * 1024 }, // Use config value or default
            useTempFiles: useTempUploads,
            tempFileDir: useTempUploads ? tmpDir?.path : undefined
        }) as express.RequestHandler
    );

    // --- Session Middleware (Potentially needed by Passport deserializeUser, CSRF, or other features) ---
    server.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false, // Don't save session if not modified
            cookie: {
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                httpOnly: true,
                sameSite: 'lax', // Good default
                maxAge: 24 * 60 * 60 * 1000 // Example: 1 day session lifetime
            }
        })
    );

    // --- Passport Initialization (after Session) ---
    initPassport(); // Configure strategies
    server.use(passport.initialize());
    // server.use(passport.session()); // Only needed if using session-based login persistence

    // --- i18next Middleware (after auth, requires req.user potentially for language detection) ---
    server.use(i18nextHttpMiddleware.handle(i18next));
    // Ensure req.t is available for H5P routes if needed by translations
    server.use((req: Request, res: Response, next: NextFunction) => {
        if (!req.t) {
            req.t = translationFunction; // Fallback if middleware didn't add it
        }
        next();
    });


    // --- Conditional CSRF Protection (Applied globally before routes that need it) ---
    // This middleware applies csurf() only if req.isTrustedServerRequest is false.
    server.use(conditionalCsrfProtection);

    // --- Middleware to set XSRF-TOKEN Cookie and add token value to user ---
    // Runs *after* conditionalCsrfProtection.
    // It will only have a req.csrfToken function if csurf ran.
    server.use((req: Request, res: Response, next: NextFunction) => {
        if (!req.isTrustedServerRequest && typeof req.csrfToken === 'function') {
            try {
                const token = req.csrfToken();
                res.cookie('XSRF-TOKEN', token, {
                    // Cookie settings should generally match session/csurf cookie settings
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    httpOnly: false // Important: Make accessible to client-side JS
                });
                // Add token value to user object for UrlGenerator (if user exists)
                if (req.user) {
                    (req.user as any).csrfTokenValue = token;
                }

            } catch (e) {
                console.error("Error setting XSRF-TOKEN cookie or adding to user:", e);
            }
        }
        next();
    });
    // Note: addCsrfTokenValueToUser middleware might be redundant now, but keeping it
    // ensures the value is explicitly set before routes like restExpressRoutes need it.
    // Place it just before routes that rely on it in the user object.


    // --- H5P Core Routes ---
    const h5pRouterBasePath = '/h5p'; // Use '/h5p' from UrlGenerator config
    server.use(
        h5pRouterBasePath,
        // CSRF protection is already handled globally by conditionalCsrfProtection if needed
        h5pAjaxExpressRouter(
            h5pEditor,
            path.resolve('h5p/core'),
            path.resolve('h5p/editor'),
            undefined,
            'auto'
        )
    );

    const htmlExporter = new H5PHtmlExporter(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        h5pEditor.config,
        path.join('h5p/core'),
        path.join('h5p/editor')
    );

    server.get('/h5p/html/:contentId', async (req, res) => {
        const html = await htmlExporter.createSingleBundle(
            req.params.contentId,
            (req as any).user,
            {
                language: req.language ?? 'en',
                showLicenseButton: true
            }
        );
        res.setHeader(
            'Content-disposition',
            `attachment; filename=${req.params.contentId}.html`
        );
        res.status(200).send(html);
    });


    // --- Custom REST Routes (CRUD operations etc.) ---
    server.use(
        h5pRouterBasePath,
        // CSRF protection handled globally
        // Ensure CSRF token value is on user object if needed by UrlGenerator called within these routes
        addCsrfTokenValueToUser, // Ensure value is set before route handler
        restExpressRoutes(
            h5pEditor,
            h5pPlayer,
            'auto'
        )
    );

    // --- Library Administration Routes ---
    server.use(
        `${h5pRouterBasePath}/libraries`,
        // CSRF protection handled globally (will be skipped if trusted request)
        libraryAdministrationExpressRouter(h5pEditor)
    );

    // --- Content Type Cache Routes ---
    server.use(
        `${h5pRouterBasePath}/content-type-cache`,
        // CSRF protection handled globally (will be skipped if trusted request)
        contentTypeCacheExpressRouter(h5pEditor.contentTypeCache)
    );

    // --- Specific API Endpoints ---

    // Validate JWT Token endpoint (Does not require CSRF protection itself)
    server.post('/validate-token', (req: Request, res: Response) => {
        console.log('Validating token for request:', {
            path: req.path,
            ip: req.ip,
            userId: req.user?.id
        });
        // This route is hit *after* authenticateRequest middleware.
        // If req.user is not anonymous, the JWT was valid (or it was a trusted request).
        if (req.user && req.user.id !== 'anonymous') {
            const responseData: any = {
                username: req.user.id, // Use id as username consistent with JWT strategy
                email: req.user.email,
                name: req.user.name,
                role: req.user.role,
                isTrusted: !!req.isTrustedServerRequest // Indicate if it was a trusted server request
            };
            console.log('User authenticated successfully:', responseData);
            // Add CSRF token *if* CSRF is active for this session (i.e., not a trusted request)
            if (!req.isTrustedServerRequest && (req.user as any).csrfTokenValue) {
                responseData.csrfToken = (req.user as any).csrfTokenValue;
                console.log('Using existing CSRF token for response');
            } else if (!req.isTrustedServerRequest && typeof req.csrfToken === 'function') {
                // Fallback: generate token if needed and wasn't added earlier
                try {
                    responseData.csrfToken = req.csrfToken();
                    console.log('Generated new CSRF token for response');
                } catch (e) {
                    console.error("Error generating fallback CSRF for /validate-token:", e);
                }
            }
            res.status(200).json(responseData);
        } else {
            // Invalid/missing token or anonymous user
            console.log('Token validation failed: Invalid or missing token');
            res.status(401).json({ error: 'Invalid or missing token' });
        }
    });

    // Login/Logout are typically session-based, CSRF protection should apply unless trusted.
    // The original example didn't have a working local strategy login,
    // so these routes are placeholders or need adjustment based on actual auth flow.

    // Example placeholder for session-based logout (if used)
    server.post('/logout', (req, res, next) => { // CSRF protection applied globally
        req.logout((err) => {
            if (err) { return next(err); }
            req.session.destroy((destroyErr) => { // Also destroy session
                if (destroyErr) {
                    console.error("Error destroying session on logout:", destroyErr);
                    return res.status(500).send("Error logging out");
                }
                res.clearCookie('connect.sid'); // Clear session cookie
                res.clearCookie('XSRF-TOKEN'); // Clear CSRF cookie
                res.status(200).json({ message: 'Logged out successfully' });
            });
        });
    });


    // --- Temporary File Cleanup ---
    if (useTempUploads) {
        server.use((req: Request, res: Response, next: NextFunction) => {
            res.on('finish', async () => {
                // Ensure req.files is handled safely
                const files = (req as any).files;
                if (files) {
                    await clearTempFiles(req as Request & { files: any });
                }
            });
            res.on('close', async () => { // Also handle abrupt connection close
                const files = (req as any).files;
                if (files) {
                    await clearTempFiles(req as Request & { files: any });
                }
            });
            next();
        });
    }

    // --- Global Error Handler ---
    server.use((err: any, req: Request, res: Response, next: NextFunction) => {
        // CSRF Error Handling
        if (err.code === 'EBADCSRFTOKEN') {
            console.error(`CSRF token validation failed: Path=${req.path}, Origin=${req.headers.origin}, IP=${req.ip}`);
            // Check if it was an AJAX request
            if (req.xhr || req.headers.accept?.includes('json')) {
                return res.status(403).json({
                    error: 'Invalid CSRF token',
                    message: 'Invalid security token. Please refresh the page and try again.'
                });
            } else {
                // Handle non-AJAX CSRF error (e.g., render an error page)
                return res.status(403).send('Invalid security token. Please refresh and try again.');
            }
        }

        // Handle other errors
        console.error('Unhandled Server Error:', err.stack || err);
        // Avoid leaking stack trace in production
        const statusCode = err.status || err.statusCode || 500;
        res.status(statusCode).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV !== 'production' ? err.message : 'An unexpected error occurred.'
        });
    });


    // --- Start Server ---
    const port = process.env.PORT || '8006';
    server.listen(port, () => {
        console.log(`🚀 H5P Express server listening on port ${port}`);
        displayIps(port); // Display accessible IP addresses
        console.log(`🔗 H5P Base URL: ${h5pUrl}${h5pRouterBasePath}`);
        console.log(`👀 WebApp URL (CORS Origin): ${process.env.WEBAPP_URL || 'Not Set'}`);
        console.log(`🛡️ CSRF Protection: Enabled (conditionally)`);
        console.log(`🔑 JWT Authentication: Enabled (conditionally)`);
        console.log(`🔒 Trusted Server Auth (AdaH5pSecret): ${checkAdaH5pSecret.toString().includes('SKIP_SECRET_CHECK') ? 'Disabled (check function seems bypassed)' : 'Enabled (check function active)'}`); // Basic check
    });

    // --- Graceful Shutdown Handling ---
    const cleanup = async (): Promise<void> => {
        console.log('Initiating graceful shutdown...');
        if (tmpDir) {
            console.log(`Cleaning up temporary directory: ${tmpDir.path}`);
            await tmpDir.cleanup().catch(e => console.error('Error cleaning up temp dir:', e));
        }
        // Add any other cleanup tasks here (e.g., close DB connections)
        console.log('Shutdown complete.');
        process.exit(0);
    };
    process.on('SIGTERM', cleanup); // Docker stop, systemd stop, etc.
    process.on('SIGINT', cleanup);  // Ctrl+C
};

start().catch(err => {
    console.error("Fatal error starting server:", err);
    process.exit(1);
});