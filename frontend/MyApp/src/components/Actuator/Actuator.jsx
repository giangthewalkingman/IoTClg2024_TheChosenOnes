import SetTimer from "./SetTimer";
import Control from "./GaugeChart/Control";
import ActuatorStatus from "./ActuatorStatus";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { host } from "../../App";
import SetTemperature from "./SetTemperature";
import convertTime from "../../data/TimeConvert";

export default function Actuator({room_id, callbackSetSignIn})
{    
    const [actuatorStatus, setActuatorStatus] = useState(null);
    const [actuatorInfoOfRoom, setActuatorInfoOfRoom] = useState(null);
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    
    const url = `http://${host}/api/room/information_tag?room_id=${room_id}`;

    const get_information_data = async (url) => 
    {
        try {
            // const data_response = await fetch(url);
            const data_response = [
                {
                    'voltage': 220.1,
                    'current': 1.4,
                    'frequency': 50,
                    'active_power': 231.4,
                    'power_factor': 0.99,
                    'time': 'May, 26 May 2024 09:00:00 GMT',
                }
            ];
            // if (data_response.status === 200) {   
            if (1) {   
            //   const data_json = await data_response.json();
              const data_json = data_response;
              if (data_json) {
                data_json[0].time = convertTime(data_json[0].time)
                // setEnergyData(data_json);   
                setIsLoading(false);
              } else {
                alert('No energy data!');
              }
            } else {
              alert(`Cannot call to server! Error code: ${data_response.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from server.');
        }
    }

    useEffect(() => {
        get_information_data(url)
    },[]);

    return (
        <>
        {
        isLoading ?
        <h1>Loading ...</h1>
        :
            <>
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
                            sx={{boxShadow: 1,
                                borderRadius: '5px', 
                                backgroundColor: "white"}}
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