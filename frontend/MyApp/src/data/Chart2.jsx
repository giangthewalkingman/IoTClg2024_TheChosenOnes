import React, {useState, useEffect} from "react"
import Grid from "@mui/material/Grid"
import {host} from "../App"
import { Box, Button, IconButton, Typography, Stack, useTheme } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { convertTimeChart } from "./TimeConvert"
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

const Chart = ({room_id, callbackSetSignIn, timedelay, optionData, apiInformationTag}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [numberOfData, setNumberOfData] = useState(1);
    const [dataChart, setDataChart] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [maxYAxis, setMaxYAxis] = useState(null);
    const para_filter_dict = {0: "temp", 1: "humid", 2: "wind", 3: "pm25"};
    const para_name = [
        {index: 0, value: `Temperature\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 1, value: `Humid\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 2, value: `Wind\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 3, value: `Dust\xa0\xa0\xa0\xa0\xa0\xa0\xa0`},
    ];
    const backend_host = host;
    const [paraFilter, setParaFilter] = useState(0);
    const [strokeColor, setStrokeColor] = useState('orange');
    const [sensorID, setSensorID] = useState(1);
    const [sensorIDList, setSensorIDList] = useState([]);
    const [timeRange, setTimeRange] = useState(0);
    const chart_url = `http://${backend_host}/sensor_node/getById/${sensorID}/${timeRange}`;
    const node_list_url = `http://${backend_host}/registration_sensor/getByRoomId/${room_id}`
    const array_filter = [
        {"name": "1D", "value": 0},
        {"name": "1W", "value": 1},
        {"name": "1M", "value": 2},
        {"name": "2M", "value": 3},
    ]
    const theme = useTheme();

    const get_chart_data = async (node_list_url, chart_url, paraFilter) => 
    {
        try {
            const node_list_response = await fetch(node_list_url);
            const chart_data_response = await fetch(chart_url);
            // const chart_data_response = [
            //     {
            //     "humid": 50.3,
            //     "id": 12,
            //     "pm25": 332,
            //     "sensor_id": 1,
            //     "status": 1,
            //     "temp": 25.4,
            //     "time": "Wed, 22 May 2024 08:00:00 GMT",
            //     "wind": 0.32
            //     },
            //     {
            //     "humid": 51.6,
            //     "id": 13,
            //     "pm25": 332,
            //     "sensor_id": 1,
            //     "status": 1,
            //     "temp": 25.5,
            //     "time": "Wed, 22 May 2024 08:05:00 GMT",
            //     "wind": 0.33
            //     },
            //     {
            //     "humid": 50.3,
            //     "id": 16,
            //     "pm25": 325,
            //     "sensor_id": 1,
            //     "status": 1,
            //     "temp": 25.8,
            //     "time": "Wed, 22 May 2024 08:15:00 GMT",
            //     "wind": 0.5
            //     },
            //     {
            //     "humid": 51.5,
            //     "id": 17,
            //     "pm25": 339,
            //     "sensor_id": 1,
            //     "status": 1,
            //     "temp": 26.2,
            //     "time": "Wed, 22 May 2024 08:20:00 GMT",
            //     "wind": 0.42
            //     },
            //     {
            //     "humid": 50.4,
            //     "id": 21,
            //     "pm25": 322,
            //     "sensor_id": 1,
            //     "status": 1,
            //     "temp": 25.6,
            //     "time": "Wed, 22 May 2024 08:10:00 GMT",
            //     "wind": 0.42
            //     },
            //     {
            //     "humid": 52.3,
            //     "id": 23,
            //     "pm25": 338,
            //     "sensor_id": 1,
            //     "status": 1,
            //     "temp": 26.9,
            //     "time": "Wed, 22 May 2024 08:25:00 GMT",
            //     "wind": 0.94
            //     }
            // ];
            // const node_list_response = [
            //     {
            //       "room_id": 1,
            //       "sensor_id": 1,
            //       "x_pos": 0.0,
            //       "y_pos": 0.0
            //     },
            //     {
            //       "room_id": 1,
            //       "sensor_id": 2,
            //       "x_pos": 0.0,
            //       "y_pos": 0.0
            //     },
            //     {
            //       "room_id": 1,
            //       "sensor_id": 3,
            //       "x_pos": 0.0,
            //       "y_pos": 0.0
            //     }
            //   ]
            if ((node_list_response.status === 200) && (chart_data_response.status === 200)) {   
            // if (1) { 
              const node_list_json = await node_list_response.json();
              const chart_data_json = await chart_data_response.json();
            // const chart_data_json = chart_data_response;
            // const node_list_json = node_list_response;
            if (chart_data_json && node_list_json) {
                let sortedData = chart_data_json.sort((a, b) => new Date(a.time) - new Date(b.time));
                let sensor_list = [];
                for (let item of sortedData) {
                    item.time = convertTimeChart(item.time);
                }
                for (let item of node_list_json) {
                    sensor_list.push(item.sensor_id);
                }
                setSensorIDList(sensor_list);
                if (chartData === null) setSensorID(sensor_list[0]);
                setDataChart(sortedData);
                // filter_data(paraFilter);
                setIsLoading(false);
            } else {
                alert('No chart data!');
            }
            } else {
                if (chart_data_response.status !== 200)
                    alert(`Cannot call to server! Error code: ${chart_data_response.status}`);
                else
                    alert(`Cannot call to server! Error code: ${node_list_response.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from server.');
        }
    }

    const filter_data = (paraFilter) => {
        switch (paraFilter) {
            case 0:        // temp
                setStrokeColor('orange')
                break;
            case 2:         // wind
                setStrokeColor('aqua')
                break;
            case 1:         // hum
                setStrokeColor('darkgreen')
                break;
            case 3:        // pm25
                setStrokeColor('red')
                break;
        }
        let newObj = [];
        let max_y_axis = 0;
        for (let item of dataChart) {
            newObj.push({
                x: item.time,
                y: item[para_filter_dict[paraFilter]],
            });
            console.log(item[para_filter_dict[paraFilter]]);
            if (item[para_filter_dict[paraFilter]] > max_y_axis) max_y_axis = item[para_filter_dict[paraFilter]] + 5;
        }
        setMaxYAxis(max_y_axis);
        setChartData(newObj);
    }

    useEffect(() => {
        if(chartData === null || isLoading === true)
            {
                get_chart_data(node_list_url, chart_url, paraFilter)
            }
            else
            {
                const timer = setTimeout(()=>{
                    get_chart_data(node_list_url, chart_url, paraFilter)
                    
                }, 60000);
                return () => clearTimeout(timer);
            }
    },[isLoading, sensorID, timeRange])

    useEffect(() => {
        filter_data(paraFilter);
    }, [paraFilter])

    return (
        <>
        <Grid container textAlign='center' justifyContent='center'>
            <Grid container display='flex' flexDirection='column' justifyContent='center' xs={12} marginY={1}>
                <Grid item>
                    <Typography component='span' textAlign='center' fontSize='20px' >
                        Environment parameter chart
                    </Typography>
                </Grid>
                <Grid item marginX={4}>
                    <Stack justifyContent='space-between' alignItems='center' direction='row'>
                        <Stack spacing={1} direction='row' justifyContent='flex-start'>
                            <FormControl style={{width: '100%'}} size='small'>
                                <InputLabel id="demo-simple-select-label">Sensor ID</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={sensorID}
                                    label="Sensor Node"
                                    onChange={(event) => {
                                        setSensorID(event.target.value);
                                        setIsLoading(true);
                                    }}
                                >
                                    {
                                        sensorIDList.map((i)=>{
                                            return (
                                                <MenuItem value={i}>
                                                    {i}
                                                </MenuItem>
                                            );	
                                        })
                                    }
                                </Select>
                            </FormControl>
                            <FormControl style={{width: '150%'}} size='small'>
                                <InputLabel id="demo-simple-select-label">Parameter</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={paraFilter}
                                    label="Sensor Node"
                                    onChange={(event) => {
                                        setParaFilter(event.target.value)
                                    }}
                                >
                                    {
                                        para_name.map((i)=>{
                                            return (
                                                <MenuItem value={i.index}>{i.value}</MenuItem>
                                            );		
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </Stack>
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' pr={2} spacing={1}>
                        {array_filter.map((i)=>{
                                return (
                                    <Button
                                        sx={{
                                            "min-width": "30px",
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                        }}
                                        style={{
                                            borderColor: theme.palette.text.primary,
                                            color: theme.palette.text.primary,
                                        }} 
                                        size="small"
                                        value={i.value}
                                        variant='outlined'
                                        onClick={(event) => {
                                            setTimeRange(event.target.value);
                                            setIsLoading(true);
                                        }}
                                        >{i.name}
                                    </Button>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
            <Grid style={{ width: '100%'}}>
                {
                    isLoading ? <h1>Loading chart...</h1> :
                    <VictoryChart
                    theme={VictoryTheme.material}
                    height={100}
                    padding={{left: 20, right: 20, bottom: 12}}
                    domain={maxYAxis}
                >
                    <VictoryAxis  
                        fixLabelOverlap={true}  
                        // tickValues specifies both the number of ticks and where
                        // they are placed on the axis
                        dependentAxis={false}       //x-axis
                        tickLength={0}
                        gridComponent={<></>}
                        style={{
                            data: { width: 10 },
                            labels: { padding: 20 },
                            axis: { stroke: "black" },
                            ticks: { stroke: "black", size: 0},
                            tickLabels: {fontSize: 4, padding: 3} //size of label of x-axis value and position of them
                        }}
                        tickCount={4}
                    />
                    <VictoryAxis 
                        fixLabelOverlap={false}  
                        dependentAxis={true}   //y_axis
                        gridComponent={<></>}
                        style={{
                            axis: { stroke: "black" },
                            ticks: { stroke: "black", size: 0},
                            tickLabels: { fontSize: 4, padding: 3}       //size of label of y-axis value, padding: position of them
                        }}
                        tickCount={4}  //number of label on y-axis
                    />
                    <VictoryLine
                        style={{ 
                            data: {
                                stroke: strokeColor,
                                strokeWidth: 1,
                                strokeLinecap: "round"
                            } 
                        }}
                        data={chartData}
                        interpolation='natural'
                        alignment="start"
                    />
                </VictoryChart>
                }
            </Grid>
        </Grid>
        </>
    );
}

export default Chart;