import { useSnackbar } from '@/app/SnackBarProvider';
import { Alert, Slide, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';



export default function () {


    const [key, setKey] = useState(0);
    const { snackbar, hideSnackbar } = useSnackbar();

    useEffect(() => {
        if (snackbar.open) {
            setKey(prevKey => prevKey + 1);
        }
    }, [snackbar.open, snackbar.message]);
    return (
        <Snackbar
            key={key}
            open={snackbar.open}
            autoHideDuration={200000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            TransitionComponent={Slide}
            TransitionProps={{ dir: "up" }}
            onClose={hideSnackbar}
        >
            <Alert onClose={hideSnackbar} icon={snackbar.icon} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
    );
}