import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Stack,
    SvgIcon,
    Typography,
    useTheme, Tooltip,
    Button
  } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {host} from "../App"
import { React, useEffect, useState } from "react";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import WavesIcon from '@mui/icons-material/Waves';

const InformationTag = ({url, callbackSetSignIn, time_delay, room_id, setActuatorInfoOfRoom}) => {
    const theme = useTheme();

    const sensor_data_url = `http://${host}/sensor_node/realtime?room_id=${room_id}`;
    const pmv_data_url = `http://${host}/pmv/env?room_id=${room_id}`
    
    const [nodeID, setNodeID] = useState(null);
    const [nodeIDlist, setNodeIDlist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [infoData, getInfoData] = useState(null);
    const [pmvData, getPmvData] = useState(null);

    const handleChange = (event) => {
        setNodeID(event.target.value);
    }

    const rating_index = {
        1 : {"level": "Good" , "colour": "green"},
        2 : {"level": "Moderate", "colour": "yellow"},
        3 : {"level": "Poor", "colour": "orange"},
        4 : {"level": "Unhealthy", "colour": "red"},
        5 : {"level": "Very Unhealthy", "colour": "purple"},
        6 : {"level": "Hazardous", "colour": "maroon"},
    };

    const define_sensor_data = 
    {
        "temp": {"name":" Temparature", "unit":"°C"},
        'wind': {"name":" Air speed", "unit":"m/s"},
        "humid": {"name":"Humidity", "unit":"%"}, 
        "pm25": {"name": "AQI", "unit": ""},
    };

    const aqi_conversion_table = [
        {'aqi_min': 0,'aqi_max': 50,'pm25_min': 0,'pm25_max': 12,},
        {'aqi_min': 51,'aqi_max': 100,'pm25_min': 12.1,'pm25_max': 35.4,},
        {'aqi_min': 101,'aqi_max': 150,'pm25_min': 35.5,'pm25_max': 55.4,},
        {'aqi_min': 151,'aqi_max': 200,'pm25_min': 55.5,'pm25_max': 150.4,},
        {'aqi_min': 201,'aqi_max': 300,'pm25_min': 150.5,'pm25_max': 250.4,},
        {'aqi_min': 300,'aqi_max': 500,'pm25_min': 250.5,'pm25_max': 500.4,},
    ]

    function convertPM25toAQI(pm25) {
        for (let range of aqi_conversion_table) {
            if (pm25 >= range.pm25_min && pm25 <= range.pm25_max) {
                let aqi = Math.floor(range.aqi_min + (pm25 - range.pm25_min) * (range.aqi_max - range.aqi_min) / (range.pm25_max - range.pm25_min));
                return aqi;
            }
        }
        return null; // return null if out of range
    }

    const EnvData = () => {
        for (let item of infoData) {
            if (item.sensor_id === nodeID) {
                return (
                    <>
                    <Grid container spacing={1} marginY={0.5} marginX={1} justifyContent='center'>
                        <Grid item xs={4}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <div style={{
                                        width: '100px', // Adjust as needed
                                        height: '100px', // Adjust as needed
                                        border: '10px solid', // Border makes the circle hollow
                                        borderColor: `${item.color}`,
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
                                            {item.aqi}
                                        </span>
                                    </div>
                                </Grid>
                                <Grid item marginY={0.5} />
                                <Grid item>
                                    <Typography fontWeight='bold' variant='h3'>{item.rating}</Typography>
                                </Grid>
                            </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
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
                                            if (item.temp == 'No data') temp = item.temp;
                                            else temp = `${item.temp} ${define_sensor_data['temp']['unit']}`
                                            return temp;
                                        })()}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                                <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                    <Grid item>
                                        <InvertColorsIcon style={{fontSize: '5.1rem'}}/>
                                    </Grid>
                                    <Grid item>
                                        <Typography textAlign='center' variant='h5'>Humidity</Typography>
                                        <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                        {((temp) => {
                                            if (item.humid == 'No data') temp = item.humid;
                                            else temp = `${item.humid} ${define_sensor_data['humid']['unit']}`
                                            return temp;
                                        })()}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                                <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                    <Grid item>
                                        <FilterDramaIcon style={{fontSize: '5.1rem'}}/>
                                    </Grid>
                                    <Grid item>
                                        <Typography textAlign='center' variant='h5'>Air speed</Typography>
                                        <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                        {((temp) => {
                                            if (item.wind == 'No data') temp = item.wind;
                                            else temp = `${item.wind} ${define_sensor_data['wind']['unit']}`
                                            return temp;
                                        })()}</Typography>
                                    </Grid>
                              </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                                <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                    <Grid item>
                                        <AccessibilityIcon style={{fontSize: '5.1rem'}}/>
                                    </Grid>
                                    <Grid item>
                                        <Typography textAlign='center' variant='h5'>Metabolic rate</Typography>
                                        <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                            {pmvData['met']}
                                        </Typography>
                                    </Grid>
                              </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                                <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                    <Grid item>
                                        <WavesIcon style={{fontSize: '5.1rem'}}/>
                                    </Grid>
                                    <Grid item>
                                        <Typography textAlign='center' variant='h5'>Clothing insulation</Typography>
                                        <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                        {pmvData['clo']}
                                        </Typography>
                                    </Grid>
                              </Grid>
                            </Paper>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid xs={12} textAlign='center' spacing={1} margin={1}>
                        <Typography textAlign='center' variant='h5'>updated on {item.time}
                        </Typography>
                    </Grid>
                    </>
                )
            }
        }
    }

    const get_information_data = async (sensor_url, pmv_url) => 
    {
        try {
            // const sensor_data_response = await fetch(sensor_url);
            // const pmv_data_response = await fetch(pmv_url);
            const sensor_data_response = [
                {
                    'sensor_id': 1,
                    'temp': 24.3,
                    'humid': 70,
                    'wind': 4.3,
                    'pm25': 32,
                    'time': '2024-05-24 18:00:00',
                },
                {
                    'sensor_id': 2,
                    'temp': 25.3,
                    'humid': 60,
                    'wind': 4.5,
                    'pm25': 42,
                    'time': '2024-05-24 18:15:00',
                },
                {
                    'sensor_id': 3,
                    'temp': 26.7,
                    'humid': 50,
                    'wind': 1.2,
                    'pm25': 12,
                    'time': '2024-05-24 18:30:00',
                }
            ];
            const pmv_data_response = {
                'met': 1.1,
                'clo': 0.6,
            }
            // if ((sensor_data_response.status === 200) && (pmv_data_response.status === 200)) {   
            if (1) {   
            //   const sensor_data_json_= await sensor_data_response.json();
            //   const pmv_data_json = await pmv_data_response.json();
              const sensor_data_json = sensor_data_response;
              const pmv_data_json = pmv_data_response;
              if (sensor_data_json && pmv_data_json) {
                let id_list = [];
                for (let item of sensor_data_json) {
                    id_list.push(item.sensor_id);
                    item.aqi = convertPM25toAQI(item.pm25); 
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
                if (nodeID === null) setNodeID(id_list[0]);
                setNodeIDlist(id_list);
                getInfoData(sensor_data_json);   
                getPmvData(pmv_data_json);
                setIsLoading(false);
              } else {
                alert('No info data!');   
              }
            } else {
                if (sensor_data_response.status !== 200)
                    alert(`Cannot call to server! Error code: ${sensor_data_response.status}`);
                else
                    alert(`Cannot call to server! Error code: ${pmv_data_response.status}`);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from server.');
          }
    }

    useEffect(() => {
        if (infoData === null || pmvData === null) {
            get_information_data(sensor_data_url, pmv_data_url)
        }
        else {
            const timer = setTimeout(()=>{
                get_information_data(sensor_data_url, pmv_data_url)
            }, time_delay);
        return () => clearTimeout(timer);
        }
    },[infoData, pmvData]);

    return (
        <>
        {
            isLoading ?
            <h1>Loading...</h1>
            :
            <Grid container textAlign='center' justifyContent='center' display='flex'>
                <Grid xs={12} sm={12} md={12} textAlign="center" columnSpacing={2}>
                    <Stack marginX={2} direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography fontWeight="bold" fontSize='21px'>
                            Node {nodeID}
                        </Typography>
                        <FormControl size='small'>
                            <InputLabel id="select-label">Node id</InputLabel>
                            <Select
                                labelId="select-label"
                                id="demo-simple-select"
                                value={nodeID}
                                label="Sensor Node"
                                onChange={handleChange}
                            >
                                {
                                    nodeIDlist.map((value)=>{
                                        return (
                                            <MenuItem value={value}>
                                                Node {value}
                                            </MenuItem>
                                        );
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Stack>
                </Grid>
                <EnvData />
            </Grid>
        }
        </>

        
    );
};

export default InformationTag;
