import * as React from 'react';
import { useState, useContext } from 'react';

import { Container,Button, CssBaseline, Box, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import NewRoom from './NewRoom';
import RoomList from './RoomList';

export default function RoomConfig({setConfig, setRoomIdForNodeConfig, setRoomSize}) {
    const [reloadRoomConfig, setReloadRoomConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
        {
        isLoading === true ?
            <h1>Loading ...</h1>
            :
            <Container maxWidth='xl'>
                <React.Fragment>
                <CssBaseline />
                <Container maxWidth="sm" sx={{ mb: 2 }}>
                    <Paper sx={{ mt: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, boxShadow: 0}}>
                        <Typography component="h1" variant="h3" align="center" py={1}>
                            New Room
                        </Typography>
                        <React.Fragment>
                            <NewRoom />
                        </React.Fragment>
                    </Paper>
                </Container>
                </React.Fragment>
                <RoomList setConfig={setConfig} setRoomIdForNodeConfig={setRoomIdForNodeConfig} setRoomSize={setRoomSize} />
            </Container>
            }
            </>
    );
}