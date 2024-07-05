import { Box, Button, IconButton, Stack, Typography, useTheme, TextField } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../Header";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import { host } from "../../App";
import ActuatorList from "./ActuatorList";
import EnvPMV from "./EnvPMV";

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
    const fan_control_url = `http://${host}/fan/control`
    const ac_control_url = `http://${host}/ac/control`

    const get_information_data = async (ac_data_url, fan_data_url) => 
    {
        try {
            const fan_data_response = await fetch(fan_data_url);
            const ac_data_response = await fetch(ac_data_url);
            if ((ac_data_response.status === 200) && (fan_data_response.status === 200)) {   
              const fan_data_json = await fan_data_response.json();
              const ac_data_json = await ac_data_response.json();
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
                            set_state: (item.set_speed === 0 ? 0 : 1),
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
                        set_state: item.state,
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
                    <EnvPMV room_id={room_id} />
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
                            <ActuatorList actuator='air_con' rows={acData} url={ac_control_url} />
                            <ActuatorList actuator='fan' rows={fanData} url={fan_control_url} />
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            </>
        }
        </>
    )
}