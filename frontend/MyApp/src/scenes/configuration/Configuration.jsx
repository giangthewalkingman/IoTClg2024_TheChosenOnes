import * as React from 'react';
import { useState } from 'react';
import { Container, Box, useTheme } from '@mui/material';
import RoomConfig from './room/RoomConfig';
import NodeConfig from './node/NodeConfig';

export default function Configuration() {
    const [config, setConfig] = useState(0);
    const [roomIdForNodeConfig, setRoomIdForNodeConfig] = useState(0);
    const [roomSize, setRoomSize] = useState({x: 0, y: 0});
    const theme = useTheme();
    const dict = {
        0: <RoomConfig setConfig={setConfig} setRoomIdForNodeConfig={setRoomIdForNodeConfig} setRoomSize={setRoomSize}/>, 
        1: <NodeConfig roomIdForNodeConfig={roomIdForNodeConfig} setConfig={setConfig} roomSize={roomSize}/>
    };
    return (
        <Container maxWidth="2000px"
            sx={{
                marginTop: '0px',
                bgcolor: theme.palette.background.default,
            }}
        >
            <Box p="1px" />
            {
                dict[config]
            }
        </Container>
    );
}