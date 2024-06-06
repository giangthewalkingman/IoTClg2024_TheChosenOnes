import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Container,Button, Grid, Box } from '@mui/material';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NodeChange from './NodeChange';
import NodeList from './NodeList';
import RoomMap from '../../../components/RoomMap/RoomMap2';
import { useTheme } from '@emotion/react';
import SendKeyConnect from './SendKeyConnect';

export default function NodeConfig({roomIdForNodeConfig, setConfig, roomSize}) {
    const theme = useTheme();
    const [configurationNodeAll, setConfigurationNodeAll] = useState([]);
    const [isLoadingNodeConfig, setIsLoadingNodeConfig] = useState(false);
    const map_length = {
        x: 384.0, y: 420.0
    }
    return (
        <>
        {
        isLoadingNodeConfig === true ?
            <h1>Loading ...</h1>
            :
            <Container maxWidth='2000px' sx={{ mt: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        backgroundColor: "black",
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "5px 12px",
                        }}
                    variant="contained"

                    onClick={()=>{
                        setConfig(0);
                    }}
                >
                    Go Back
                </Button>
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={9}>
                        <NodeList roomIdForNodeConfig={roomIdForNodeConfig} />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <RoomMap 
                            room_id={roomIdForNodeConfig} backend_host={host} 
                            map_length={map_length} heatMapView={false}
                        />
                            <SendKeyConnect />
                    </Grid>
                </Grid>
            </Container>
            }
            </>
    );
}