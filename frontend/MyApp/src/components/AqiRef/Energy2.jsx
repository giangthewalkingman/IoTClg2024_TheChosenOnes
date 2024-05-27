import { React, useEffect, useState } from "react";
import { Grid, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import convertTime from "../../data/TimeConvert"

const Energy = ({room_id, callbackSetSignIn, time_delay, backend_host}) =>{
    const url = `http://${backend_host}/energy_measure/realtime`;
    const [isLoading, setIsLoading] = useState(true);
    const [energyData, setEnergyData] = useState(null);
    const preferMd = useMediaQuery('(max-width:900px)');    
    const theme = useTheme();

    const define_energy_data = {
        'voltage': {'name': 'Voltage', 'unit': 'V'},
        'current': {'name': 'Current', 'unit': 'A'},
        'frequency': {'name': 'Frequency', 'unit': 'Hz'},
        'active_power': {'name': 'Active Power', 'unit': 'W'},
        'power_factor': {'name': 'Power factor', 'unit': null},
        'time': {'name': null, 'unit': null},
    }
    const energy_data_property_array = Object.keys(define_energy_data);

    const get_energy_data = async (url) => 
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
                setEnergyData(data_json);   
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
        if (energyData === null) {
            get_energy_data(url)
        }
        else {
            const timer = setTimeout(()=>{
                get_energy_data(url) 
            }, time_delay);
            return () => clearTimeout(timer);
        }
    },[energyData])

    return (
        <>
        {
            isLoading ? <h1>Loading...</h1> :
            <Grid container item textAlign='center' paddingTop={preferMd ? 0 : 0.5} 
            justifyContent='center'>
                <Grid item xs={12} sm={12} md={12} textAlign="center" my={0.25} >
                    <Typography fontWeight="bold" fontSize='21px'>
                        Energy Data
                    </Typography>
                </Grid>
                <Grid item container spacing={1} px='10px' marginBottom={0.5} justifyContent='center'>
                    {energy_data_property_array.map((value, index) => {
                        if (index < 5)
                        return (
                            <Grid item xs={(index < 3) ? 4 : 6}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxShadow: 0 }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px'}} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                                <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                    <Grid container item justifyContent='center' alignContent='center'>
                                        <Typography variant='h5'>{define_energy_data[value]['name']}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant='h2' fontWeight='bold'>
                                            {((temp) => {
                                                if (energyData[0][energy_data_property_array[index]] == 'NULL' || index == 4) temp = energyData[0][energy_data_property_array[index]] ;
                                                else temp = `${energyData[0][energy_data_property_array[index]] } ${define_energy_data[value]['unit']}`
                                                return temp;
                                            })()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        )
                    })}
                </Grid>
                <Grid xs={12} textAlign='center' spacing={1} marginY={1}>
                    <Typography textAlign='center' variant='h5'>updated on {energyData[0].time}
                    </Typography>
                </Grid>
            </Grid>
        }
        </>
    );
}

export default Energy;