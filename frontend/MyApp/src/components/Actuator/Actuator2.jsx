import SetTimer from "./SetTimer";
import Control from "./GaugeChart/Control";
import ActuatorStatus from "./ActuatorStatus";
import { Box, Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../Header";
import { useState, useEffect } from "react";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { host } from "../../App";
import SetTemperature from "./SetTemperature";
import { DataGrid } from '@mui/x-data-grid';
import ActuatorList from "./ActuatorList";

export default function Actuator({room_id, callbackSetSignIn})
{    
    const [actuatorStatus, setActuatorStatus] = useState(null);
    const [actuatorInfoOfRoom, setActuatorInfoOfRoom] = useState([]);
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    
    const ac_data_url = `http://${host}/air_conditioner/getlast/${room_id}`;
    const fan_data_url = `http://${host}/fan/getlast/${room_id}`;

    const get_information_data = async (ac_data_url, fan_data_url) => 
    {
        try {
            // const fan_data_response = await fetch(fan_data_url);
            // const ac_data_response = await fetch(ac_data_url);
            const fan_data_response = [
                {
                    "control_mode": 2,
                    "fan_id": 1,
                    "id": 6,
                    "set_speed": 70.0,
                    "set_time": 250,
                    "status": 1,
                    "time": "Wed, 22 May 2024 08:45:00 GMT"
                },
                {
                    "control_mode": 2,
                    "fan_id": 2,
                    "id": 8,
                    "set_speed": 14.0,
                    "set_time": 250,
                    "status": 1,
                    "time": "Wed, 22 May 2024 08:45:00 GMT"
                }
            ]
            const ac_data_response = [
                {
                    "ac_id": 1,
                    "control_mode": 0,
                    "id": 1,
                    "set_temp": 25.0,
                    "state": 1,
                    "status": 1,
                    "time": "Wed, 22 May 2024 06:00:00 GMT"
                },
            ];
            // if ((ac_data_response.status === 200) && (fan_data_response.status === 200)) {   
            if (1) {   
            //   const fan_data_json = await fan_data_response.json();
            //   const ac_data_json = await ac_data_response.json();
              const fan_data_json = fan_data_response;
              const ac_data_json = ac_data_response;
              if (fan_data_json && ac_data_json) {
                
                setIsLoading(false);
              } else {
                alert('No energy data!');
              }
            } else {
                if (fan_data_response.status !== 200)
                    alert(`Cannot call to server! Error code: ${fan_data_response.status}`);
                else
                    alert(`Cannot call to server! Error code: ${ac_data_response.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from server.');
        }
    }

    useEffect(() => {
        get_information_data(ac_data_url, fan_data_url)
    },[]);

    return (
        <>
        {
        isLoading ?
        <h1>Loading ...</h1>
        :
            <>
            <Grid container px={1} xs={12} sm={12} md={12} rowSpacing={2}>
                <Grid item xs={12}>
                    <Box
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%" height="100%" display="flex"
                        flexDirection="column" alignContent="center" justifyContent="center"
                    >
                        <Grid container display='flex' flexDirection='row'>
                            <ActuatorList actuator='air_con' />
                            <ActuatorList actuator='fan' />
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            {
                actuatorInfoOfRoom.length !== 0 ?
                <>
                    {
                        actuatorInfoOfRoom.map(e=>{
                            return(
                                <Grid
                                container
                                alignItems="stretch"
                                style={{
                                        display: "flex", 
                                        height: "100%", 
                                        // backgroundColor: "red"
                                    }}
                                justify="space-between" 
                            >
                                <Grid
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    container="true"
                                    display="flex"
                                    direction="column"
                                >
                                    <Box 
                                        sx={{boxShadow: 0,
                                            borderRadius: '5px', 
                                            backgroundColor: theme.palette.background.paper}}
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <h1>Actuator node id: {e["node_id"]}</h1>
                                    </Box>
                                </Grid>

                                <Grid
                                    p="10px"
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={4}
                                    container="true"
                                    display="flex"
                                    direction="column"
                                >
                                    <Box 
                                        sx={{boxShadow: 0,
                                            borderRadius: '5px', 
                                            backgroundColor: theme.palette.background.paper}}
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Box mt="10px" mb="15px">
                                            <SetTimer actuatorStatus={actuatorStatus}
                                                    room_id={room_id}
                                                    callbackSetSignIn={callbackSetSignIn}
                                                    node_id={e["node_id"]}
                                                    />
                                        </Box>
                                    </Box>
                                    
                                </Grid>
                                <Grid
                                        p="10px"
                                        item={true}
                                        xs={12}
                                        sm={12}
                                        lg={4}
                                        display="flex"
                                        direction="column"
                                        alignItems="center"
                                        justify="center"
                                        
                                    >
                                        <Box 
                                            sx={{boxShadow: 0,
                                                borderRadius: '5px', 
                                                backgroundColor: theme.palette.background.paper}}
                                            width="100%"
                                            height="100%"
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Box mt="10px" mb="10px">
                                                {/* <Header title="Set temperature:" fontSize="20px"/> */}
                                                {/* <Control room_id={room_id} callbackSetSignIn={callbackSetSignIn} actuatorStatus={actuatorStatus}/> */}
                                                <SetTemperature actuatorStatus={actuatorStatus} node_id={e["node_id"]} callbackSetSignIn={callbackSetSignIn} room_id={room_id}/>
                                            </Box>
                                        </Box>
                                </Grid>
                                <Grid
                                    p="10px"
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={4}
                                    container="true"
                                    display="flex"
                                    direction="column"
                                >
                                    <Box
                                        sx={{boxShadow: 0,
                                            borderRadius: '5px', 
                                            backgroundColor: theme.palette.background.paper}}
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Box mt="10px" mb="15px"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justify="center">

                                            <Header title="Actuator Status:" fontSize="20px"/>
                                            <ActuatorStatus room_id={room_id} setActuatorStatus={setActuatorStatus} callbackSetSignIn={callbackSetSignIn}
                                                node_id={e["node_id"]}
                                                actuatorStatus={actuatorStatus}    
                                            />
                                        </Box>
                                    </Box>

                                </Grid>
                            </Grid>
                            )
                        })
                    }
                </>
                
                :
                <Grid
                    container
                    alignItems="stretch"
                    style={{
                            display: "flex", 
                            height: "100%", 
                            // backgroundColor: "red"
                        }}
                    justify="space-between" 
                >
                    <Grid
                        p="10px"
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        container="true"
                        display="flex"
                        direction="column"
                    >
                        <Box 
                            sx={{boxShadow: 0,
                                borderRadius: '5px', 
                                backgroundColor: theme.palette.background.paper}}
                            width="100%"
                            height="100%"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <h1>No actuator is available!</h1>
                        </Box>
                    </Grid>
                </Grid>
            }
            </>
        }
        </>
    )
}