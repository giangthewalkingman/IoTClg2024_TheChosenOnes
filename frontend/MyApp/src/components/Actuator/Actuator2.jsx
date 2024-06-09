import SetTimer from "./SetTimer";
import Control from "./GaugeChart/Control";
import ActuatorStatus from "./ActuatorStatus";
import { Box, Button, IconButton, Stack, Typography, useTheme, TextField } from "@mui/material";
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
    const [isLoading, setIsLoading] = useState(true);
    const [acData, setACData] = useState([]);
    const [fanData, setFanData] = useState([]);
    
    const ac_data_url = `http://${host}/air_conditioner/getlast/${room_id}`;
    const fan_data_url = `http://${host}/fan/getlast/${room_id}`;

    const get_information_data = async (ac_data_url, fan_data_url) => 
    {
        try {
            const fan_data_response = await fetch(fan_data_url);
            const ac_data_response = await fetch(ac_data_url);
            // const fan_data_response = [
            //     {
            //         "control_mode": 2,
            //         "fan_id": 1,
            //         "id": 6,
            //         "set_speed": 70.0,
            //         "set_time": 250,
            //         "status": 1,
            //         "time": "Wed, 22 May 2024 08:45:00 GMT"
            //     },
            //     {
            //         "control_mode": 2,
            //         "fan_id": 2,
            //         "id": 8,
            //         "set_speed": 14.0,
            //         "set_time": 250,
            //         "status": 1,
            //         "time": "Wed, 22 May 2024 08:45:00 GMT"
            //     }
            // ]
            // const ac_data_response = [
            //     {
            //         "ac_id": 1,
            //         "control_mode": 0,
            //         "id": 1,
            //         "set_temp": 25.0,
            //         "state": 1,
            //         "status": 1,
            //         "time": "Wed, 22 May 2024 06:00:00 GMT"
            //     },
            // ];
            if ((ac_data_response.status === 200) && (fan_data_response.status === 200)) {   
            // if (1) {   
              const fan_data_json = await fan_data_response.json();
              const ac_data_json = await ac_data_response.json();
            //   const fan_data_json = fan_data_response;
            //   const ac_data_json = ac_data_response;
              if (fan_data_json && ac_data_json) {
                let fan_data_table = []
                let ac_data_table = [];
                for (let item of fan_data_json) {
                    fan_data_table.push(
                        { 
                            id: item.fan_id,
                            value: item.set_speed,
                            set_value: item.set_speed,
                            control_mode: item.control_mode,
                            state: (item.set_speed === 0 ? 0 : 1),
                        }
                    )
                }
                for (let item of ac_data_json) {
                    ac_data_table.push({
                        id: item.ac_id,
                        value: item.set_temp,
                        set_value: item.set_temp,
                        control_mode: item.control_mode,
                        state: item.state,
                    })
                }
                setFanData(fan_data_table)
                setACData(ac_data_table)
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
        if (isLoading === true) {
            get_information_data(ac_data_url, fan_data_url)
          }
          else {
            const timer = setTimeout(()=>{
                get_information_data(ac_data_url, fan_data_url)
            }, 60000);
            return () => clearTimeout(timer);
          }
    },[]);

    return (
        <>
        {
        isLoading ?
        <h1>Loading ...</h1>
        :
            <>
            <Grid container p={1} xs={12} sm={12} md={12} rowSpacing={2}>
                <Grid item xs={12}>
                    <Box
                        px={1} py={1}
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%" height="100%" display="flex" alignContent="center" justifyContent="center"
                    >
                        <Grid container>
                            <Grid item xs={12} md={6} alignContent='center'>
                                <Typography variant="h3" fontWeight='bold'>
                                    Room environment settings
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6} alignContent='center'>
                                <Stack direction={{xs: 'column', md: 'row'}} justifyContent='flex-end' alignItems='center' spacing={3}>
                                    <TextField
                                        required
                                        id="met"
                                        name="met"
                                        label="Metabolic rate"
                                        autoComplete="met"
                                        variant="standard"
                                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
                                    />
                                    <TextField
                                        required
                                        id="clo"
                                        name="clo"
                                        label="Clothing insulation"
                                        autoComplete="clo"
                                        variant="standard"
                                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
                                    />
                                    <TextField
                                        required
                                        id="pmv_ref"
                                        name="pmv_ref"
                                        label="PMV reference"
                                        autoComplete="pmv_ref"
                                        variant="standard"
                                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
                                    />
                                    <Button
                                        sx={{
                                            "min-width": "30px",
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                        }}
                                        style={{
                                            borderColor: theme.palette.background.paper,
                                            backgroundColor: theme.palette.text.primary,
                                            color: theme.palette.background.paper,
                                        }}
                                        size="small"
                                        // onClick={}
                                    >
                                        Set
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%" height="100%" display="flex"
                        flexDirection="column" alignContent="center" justifyContent="center"
                    >
                        <Grid container display='flex' flexDirection='row'>
                            <ActuatorList actuator='air_con' rows={acData} />
                            <ActuatorList actuator='fan' rows={fanData} />
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            </>
        }
        </>
    )
}