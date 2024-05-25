import { React, useEffect, useState } from "react";
import { Grid, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { host } from "../../App";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import SpeedIcon from '@mui/icons-material/Speed';

export default function AqiRef({callbackSetSignIn, time_delay})
{
    const url = `http://${host}/localweather/get`;
    const theme = useTheme();

    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState(null);

    const rating_index = {
        1 : {"level": "Good" , "colour": "green"},
        2 : {"level": "Moderate", "colour": "yellow"},
        3 : {"level": "Poor", "colour": "orange"},
        4 : {"level": "Unhealthy", "colour": "red"},
        5 : {"level": "Very Unhealthy", "colour": "purple"},
        6 : {"level": "Hazardous", "colour": "maroon"},
    };
    
    const get_local_weather = async (url) =>
    {
        try {
            // const data_response = await fetch(url);
            const data_response = [
                {
                    'temp': 24.3,
                    'humid': 70,
                    'wind': 4.3,
                    'aqi': 66,
                    'time': '2024-05-24 18:00:00',
                }
            ];
            // const props = Object.keys(data_response);
            // if (data_response.status === 200) {   
            if (1) {   
            //   const data_json = await data_response.json();
              const data_json = data_response;
              if (data_json) {
                for (let item of data_json) {
                    if (item.aqi <= 50) {
                      item.rating = rating_index[1]['level'];
                      item.color = rating_index[1]['colour'];
                    } else if (item.aqi <= 100) {
                      item.rating = rating_index[2]['level'];
                      item.color = rating_index[2]['colour'];
                    } else if (item.aqi <= 150) {
                        item.rating = rating_index[3]['level'];
                        item.color = rating_index[3]['colour'];
                    } else if (item.aqi <= 200) {
                        item.rating = rating_index[4]['level'];
                        item.color = rating_index[4]['colour'];
                    } else if (item.aqi <= 300) {
                        item.rating = rating_index[5]['level'];
                        item.color = rating_index[5]['colour'];
                    } else {
                        item.rating = rating_index[6]['level'];
                        item.color = rating_index[6]['colour'];
                    }
                }
                setData(data_json);
                setIsLoading(false);
              } else {
                alert('No local weather data!');
              }
            } else {
              alert(`Cannot call to server! Error code: ${data_response.status}`);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from server.');
          }
    }

    useEffect(()=>{
        if (data === null) {
            get_local_weather(url)
        }
        else {
            const timer = setTimeout(()=>{
                get_local_weather(url)
            }, time_delay);
        return () => clearTimeout(timer);
        }
    },[data])


    return(
        <>
            {
                isLoading ?
                <h1>Loading...</h1>
                :
                <Grid container item textAlign='center'>
                <Grid xs={12} sm={12} md={12} textAlign="center">
                    <Typography fontSize='21px' fontWeight="bold">
                        Hanoi AQI: Hanoi Real-time Air Quality Index (AQI)
                    </Typography>
                </Grid>
                <Grid container spacing={1} marginY={0.5} px='10px'>
                    <Grid item xs={3}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <div style={{
                                        width: '100px', // Adjust as needed
                                        height: '100px', // Adjust as needed
                                        border: '10px solid', // Border makes the circle hollow
                                        borderColor: `${data[0]['color']}`,
                                        borderRadius: '50%', // Makes the div a circle
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        position: 'relative',
                                    }}>
                                        <span style={{
                                            position: 'relative',
                                            color: theme.palette.text.primary,
                                            fontSize: '28px',
                                            fontWeight: 'bold'
                                        }}>
                                            {data[0]['aqi']}
                                        </span>
                                    </div>
                                </Grid>
                                <Grid item marginY={0.5} />
                                <Grid item>
                                    <Typography fontWeight='bold' variant='h3'>{data[0]['rating']}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                            <Grid container display="flex" flexDirection="column" alignContent='center' alignItems='center' textAlign='center'>
                                <Grid item>
                                    <ThermostatIcon style={{fontSize: '5.1rem'}}/>
                                </Grid>
                                <Grid item>
                                    <Typography textAlign='center' variant='h5'>Temperature</Typography>
                                    <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                        {((temp) => {
                                        if (data[0]['temp'] == 'No data') temp = data[0]['temp'];
                                        else temp = `${data[0]['temp']} °C`
                                        return temp;
                                    })()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                            <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                <Grid item>
                                    <SpeedIcon style={{fontSize: '5.1rem'}}/>
                                </Grid>
                                <Grid item>
                                    <Typography textAlign='center' variant='h5'>Humidity</Typography>
                                    <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                    {((temp) => {
                                        if (data[0]['humid'] == 'No data') temp = data[0]['humid'];
                                        else temp = `${data[0]['humid']} %`
                                        return temp;
                                    })()}                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                            <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                <Grid item>
                                    <InvertColorsIcon style={{fontSize: '5.1rem'}}/>
                                </Grid>
                                <Grid item>
                                    <Typography textAlign='center' variant='h5'>Wind speed</Typography>
                                    <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                    {((temp) => {
                                        if (data[0]['wind'] == 'No data') temp = data[0]['wind'];
                                        else temp = `${data[0]['wind']} m/s`
                                        return temp;
                                    })()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                </Grid>
                <Grid xs={12} textAlign='center' margin={1}>
                    <Typography textAlign='center' variant='h5' component='span'>updated on {data[0]['time']}
                    </Typography>
                    <Typography variant='h5' component='a' color='darkgray' href="https://aqicn.org/city/vietnam/hanoi/">https://aqicn.org/city/vietnam/hanoi/</Typography>
                </Grid>
            </Grid>
            }
        </>
    );
}