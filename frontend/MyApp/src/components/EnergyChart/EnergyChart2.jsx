import React, { useEffect, useState } from "react";
import { Grid, Typography, Stack, Button, useTheme } from "@mui/material";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryLine, Flyout } from "victory";
import {convertTimeChart} from "../../data/TimeConvert";

const EnergyChart = ({room_id, callbackSetSignIn, time_delay, backend_host}) => {
    const [maxYAxis, setMaxYAxis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(0);
    const theme = useTheme();
    const [powerData, setPowerData] = useState({'time': null, 'active_power': null});
    const url_chart = `http://${backend_host}/energy_measure/getById/1/${timeRange}`;

    const get_chart_data = async (url) => 
    {
        try {
            const data_response = await fetch(url);
            // const data_response = [
            //     {
            //       "active_power": 240.3,
            //       "current": 1.7,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 1,
            //       "power_factor": 0.99,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:00:00 GMT",
            //       "voltage": 220.5
            //     },
            //     {
            //       "active_power": 286.8,
            //       "current": 1.3,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 2,
            //       "power_factor": 0.98,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:04:00 GMT",
            //       "voltage": 220.6
            //     },
            //     {
            //       "active_power": 308.3,
            //       "current": 1.4,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 3,
            //       "power_factor": 0.99,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:05:00 GMT",
            //       "voltage": 220.2
            //     },
            //     {
            //       "active_power": 331.35,
            //       "current": 1.5,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 4,
            //       "power_factor": 0.99,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:10:00 GMT",
            //       "voltage": 220.9
            //     },
            //     {
            //       "active_power": 376.6,
            //       "current": 1.7,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 5,
            //       "power_factor": 1.0,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:15:00 GMT",
            //       "voltage": 221.5
            //     },
            //     {
            //       "active_power": 355.2,
            //       "current": 1.6,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 6,
            //       "power_factor": 0.99,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:20:00 GMT",
            //       "voltage": 222.0
            //     },
            //     {
            //       "active_power": 373.32,
            //       "current": 1.7,
            //       "em_id": 1,
            //       "frequency": 50,
            //       "id": 7,
            //       "power_factor": 0.98,
            //       "status": 1,
            //       "time": "Wed, 22 May 2024 06:25:00 GMT",
            //       "voltage": 219.6
            //     }
            //   ]
            if (data_response.status === 200) {   
            // if (1) {   
              const data_json = await data_response.json();
            //   const data_json = data_response;
              if (data_json) {
                let power_data = [];
                let max_y_data = 0;
                for (let item of data_json) {
                    item.time = convertTimeChart(item.time);
                    power_data.push({
                        x: item.time,
                        y: item.active_power,
                        y0: 0,
                        label:`${item.time}\n${item.active_power} W`
                    })
                    if (item.active_power > max_y_data) max_y_data = item.active_power + 50;
                }
                setMaxYAxis(max_y_data);
                setPowerData(power_data);   
                setIsLoading(false);
              } else {
                alert('No chart data!');
              }
            } else {
              alert(`Cannot call to server! Error code: ${data_response.status}`);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from server.');
          }
    }

    const array_filter = [
        {"name": "1D", "value": 0},
        {"name": "1W", "value": 1},
        {"name": "1M", "value": 2},
        {"name": "2M", "value": 3},
    ]

    useEffect(() => {
        if (powerData.active_power === null) {
            get_chart_data(url_chart)
        }
        else {
            const timer = setTimeout(()=>{
                get_chart_data(url_chart)
            }, time_delay);
            return () => clearTimeout(timer);
        }
    },[powerData, isLoading, timeRange])

    return (
        <Grid container textAlign='center' justifyContent='center'>
                <Grid container display='flex' flexDirection='column' justifyContent='center' xs={12} marginY={1}>
                    <Grid item>
                        <Typography component='span' textAlign='center' fontSize='20px'>
                            Average active power
                        </Typography>
                    </Grid>
                    <Grid item marginX={4}>
                        <Stack justifyContent='space-between' alignItems='center' direction='row'>
                            <Stack spacing={1} direction='row' >
                                <Button size="small" sx={{
                                            "min-width": "30px",
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                        }}
                                        style={{
                                            color: theme.palette.background.default,
                                            backgroundColor: theme.palette.text.primary,
                                        }}
                                        variant='outlined' 
                                        >
                                    Power
                                </Button>
                            </Stack>
                            <Stack direction='row' justifyContent='flex-end' pr={2} spacing={1}>
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
                {isLoading ? <h1>Loading chart...</h1> : 
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
                        tickCount={2}
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
                        labelComponent=
                        {<VictoryTooltip 
                            style={{fontSize: '2.7px', lineHeight: 1}}
                            cornerRadius={1}
                            pointerLength={0}
                            flyoutStyle={{
                                strokeWidth: 0.1,
                            }}
                            flyoutComponent={
                                <Flyout 
                                    height={10}
                                    width={30}
                                />
                            }
                        />}
                        alignment="start"
                        style={{ data: { stroke: "#c43a31"} }}
                        data={powerData}
                        interpolation='natural'
                        events={[{
                        target: "data",
                        eventHandlers: {
                            onMouseOver: () => {
                            return [
                                {
                                target: "data",
                                mutation: () => ({style: {stroke: "red"}})
                                }, {
                                target: "labels",
                                mutation: () => ({ active: true })
                                }
                            ];
                            },
                            onMouseOut: () => {
                            return [
                                {
                                target: "data",
                                mutation: () => {}
                                }, {
                                target: "labels",
                                mutation: () => ({ active: false })
                                }
                            ];
                            }
                        }
                        }]}
                    />
                </VictoryChart>}
                </Grid>
            </Grid>
    )
}

export default EnergyChart;
