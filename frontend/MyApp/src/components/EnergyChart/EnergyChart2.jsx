import React, { useEffect, useState } from "react";
import { Grid, Typography, Stack, Button, useTheme } from "@mui/material";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryLine, Flyout } from "victory";

const EnergyChart = ({room_id, callbackSetSignIn, time_delay, backend_host}) => {
    const [chartData, setChartData] = useState([])
    const [dataType, setDataType] = useState(0) // 0 is energyData, 1 is powerData
    const [maxYAxis, setMaxYAxis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const theme = useTheme();
    const [energyData, setEnergyData] = useState({'time': [], 'active_energy': []});
    const [powerData, setPowerData] = useState({
        'hour': [
            "1 am", "2 am", "3 am", "4 am", "5 am", "6 am", "7 am", "8 am", "9 am", "10 am", "11 am", "12 am",
            "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm", "7 pm", "8 pm", "9 pm", "10 pm", "11 pm", "12 pm",
        ],
        'active_power': [
            458, 512, 367, 782, 644, 734, 896, 921, 875, 699, 543, 456,
            789, 643, 765, 943, 732, 512, 684, 876, 921, 764, 598, 421
        ]
    })
    const months = [
        'Jan', 'Feb','Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const url_energy = `http://${backend_host}/api/energydata/monitor?room_id=${room_id}`

    const get_energy_data = async (url, access_token) => 
    {
        const headers = 
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch = 
        {
            "method": "GET",
            "headers": headers,
            "body": null,
        }

        const response = await fetch(url, option_fetch);
        const data = await response.json();
        let newEnergyData = {
            'time': [],
            'active_energy': []
        };
        if(response.status === 200)
        {
            // const data = [
            //     ['3_2024', '4_2024'],
            //     [1000, 2440]
            // ]
            const startYear = data[0][0].split('_')[1];
            const endYear = data[0][data[0].length - 1].split('_')[1];
            let count = 0;
            
            for (let year = startYear; year <= endYear; year++) {
                for (let month = 0; month < 12; month++) {
                    let check_month = `${month+1}_${year}`
                    if (check_month === data[0][count]) {
                        newEnergyData.active_energy.push(data[1][count]);
                        count++;
                    }
                    else newEnergyData.active_energy.push(0);
                    newEnergyData.time.push(`${months[month]} ${year}`)
                }
            }
        }
        else
        {
            newEnergyData['time'].push(0);
            newEnergyData['active_energy'].push(0);
        }
        setEnergyData(newEnergyData);
        setIsLoading(false)
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url) => 
    {
        const token = {access_token: null, refresh_token: null}
        // const backend_host = host;
        if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null)
        {
            token.access_token = localStorage.getItem("access"); 
            token.refresh_token = localStorage.getItem("refresh");
        }
        else
        {
            throw new Error("There is no access token and refresh token ....");
        }

        const verifyAccessToken  = async () =>
        {
            //call the API to verify access-token
            const verify_access_token_API_endpoint = `http://${backend_host}/api/token/verify`
            const verify_access_token_API_data = 
            {
                "token": token.access_token,
            }
            const verify_access_token_API_option = 
            {
                "method": "POST",
                "headers": 
                {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify(verify_access_token_API_data),

            }
            const verify_access_token_API_response = await fetch(verify_access_token_API_endpoint, 
                                                                verify_access_token_API_option,);
            if(verify_access_token_API_response.status !== 200)
            {
                return false;
            }
            return true;
        }

        /*
        *brief: this function is to verify the refresh-token and refresh the access-token if the refresh-token is still valid
        */
        const verifyRefreshToken  = async () =>
        {
            //call the API to verify access-token
            const verify_refresh_token_API_endpoint = `http://${backend_host}/api/token/refresh`
            const verify_refresh_token_API_data = 
            {
                "refresh": token.refresh_token,
            }
            const verify_refresh_token_API_option = 
            {
                "method": "POST",
                "headers": 
                {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify(verify_refresh_token_API_data),

            }
            const verify_refresh_token_API_response = await fetch(verify_refresh_token_API_endpoint, 
                                                                    verify_refresh_token_API_option,);
            const verify_refresh_token_API_response_data = await verify_refresh_token_API_response.json();
            if(verify_refresh_token_API_response.status !== 200)
            {
                return false;
            }
            else if(verify_refresh_token_API_response.status === 200 &&  verify_refresh_token_API_response_data.hasOwnProperty("access"))
            {
                localStorage.setItem("access", verify_refresh_token_API_response_data["access"]);
                localStorage.setItem("refresh", verify_refresh_token_API_response_data["refresh"]);
                return true
            }
            else
            {
                throw new Error("Can not get new access token ....");
            }
        }

        const  verifyAccessToken_response = await verifyAccessToken();

        if(verifyAccessToken_response === true)
        {
            // const response = await fetch(url)
            // const data = await response.json()
            fetch_data_function(url, token["access_token"])
        }
        else
        {
            let verifyRefreshToken_response = null;
            try
            {
                verifyRefreshToken_response = await verifyRefreshToken();
            }
            catch(err)
            {
                alert(err);
            }
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(url, token["access_token"]);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }
    }

    function getChartData(dataType) {
        let data = [];
        let label, unit;
        if (dataType) {
            data = powerData;
            label = 'Power';
            unit = 'kW'
        } else  {
            data = energyData;
            label = 'Energy';
            unit = 'kWh'
        }
        const keys = Object.keys(data);
        const result = [];
        for (let i = 0; i < data[keys[0]].length; i++) {
            result.push({
                x: data[keys[0]][i],
                y: data[keys[1]][i],
                y0: 0,
                label:`${data[keys[0]][i]}\n${label}: ${data[keys[1]][i]}${unit}`
            });
        }
        setMaxYAxis(Math.max(...data[keys[1]]))
        setChartData(result);
    }

    const array_filter = [
        {"name": "1D", "value": 1},
        {"name": "1W", "value": 2},
        {"name": "1M", "value": 3},
        {"name": "6M", "value": 4},
        {"name": "1Y", "value": 5},
    ]

    useEffect(() => {
        getChartData(dataType);
        if(time_delay !== 0)
        {
            if(energyData === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
            {
                verify_and_get_data(get_energy_data, callbackSetSignIn, backend_host, url_energy); 
            }
            else
            {
                const timer = setTimeout(()=>{
                        verify_and_get_data(get_energy_data, callbackSetSignIn, backend_host, url_energy); 
                    }, time_delay);
                return () => clearTimeout(timer);
            }
        }
        else
        {
            verify_and_get_data(get_energy_data, callbackSetSignIn, backend_host, url_energy); 
        }
    },[energyData, isLoading, dataType])

    return (
        <Grid container textAlign='center' justifyContent='center'>
                <Grid container display='flex' flexDirection='column' justifyContent='center' xs={12} marginY={1}>
                    <Grid item>
                        <Typography component='span' textAlign='center' fontSize='20px'>
                            {dataType ? 'Average active power' : 'Total active energy per month'}
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
                                            color: (!dataType ? theme.palette.background.default : theme.palette.text.primary),
                                            backgroundColor: (!dataType ? theme.palette.text.primary : theme.palette.background.default),
                                        }}
                                        variant={dataType ? 'outlined' : 'contained'}
                                        onClick={() => {
                                            setDataType(0);
                                        }}
                                        >
                                    Energy
                                </Button>
                                <Button size="small" sx={{
                                            "min-width": "30px",
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                        }}
                                        style={{
                                            color: (dataType ? theme.palette.background.default : theme.palette.text.primary),
                                            backgroundColor: (dataType ? theme.palette.text.primary : theme.palette.background.default),
                                        }}
                                        variant={dataType ? 'contained' : 'outlined'}
                                        onClick={() => {
                                            setDataType(1);
                                        }}>
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
                    {dataType 
                    ?
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
                        data={chartData}
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
                    :
                    <VictoryBar
                        labelComponent=
                        {<VictoryTooltip 
                            style={{fontSize: '5px', lineHeight: 1}}
                            cornerRadius={1}
                            pointerLength={0}
                            flyoutStyle={{
                                strokeWidth: 0.1,
                            }}
                            flyoutComponent={
                                <Flyout 
                                    height={20}
                                    width={50}
                                />
                            }
                        />}
                        alignment="start"
                        style={{ data: { fill: "#c43a31"} }}
                        data={chartData}
                        barWidth={300 / chartData.length}
                        events={[{
                        target: "data",
                        eventHandlers: {
                            onMouseOver: () => {
                            return [
                                {
                                target: "data",
                                mutation: () => ({style: {fill: "red"}})
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
                    }
                </VictoryChart>}
                </Grid>
            </Grid>
    )
}

export default EnergyChart;
