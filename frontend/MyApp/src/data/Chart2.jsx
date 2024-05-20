import React, {useState, useEffect} from "react"
import { Stack, Typography } from "@mui/material"
import Grid from "@mui/material/Grid"
import {host} from "../App"
import VictoryLineChart from "../components/VictoryChart/VictoryLineChart"
import Header from "../components/Header"
import SmallFilter from "./SmallFilter";
import Container from "@mui/material/Container";
import FilterNode from "../components/RoomMap/FilterNode";
import FilterParameter from "../components/RoomMap/FilterParameter";

const Chart = ({room_id, callbackSetSignIn, timedelay, optionData, apiInformationTag}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [numberOfData, setNumberOfData] = useState(1);
    const [dataChart, setDataChart] = useState({co2: null, hum: null, temp: null, tvoc: null, light: null, dust: null, time: null});
    const para_filter_dict = {0: "all", 1: "temp", 2: "hum", 3: "co2", 4: "tvoc", 5: "light", 6: "dust"};
    const para_name = {0: "All", 1: "Temperature", 2: "Humidity", 3: "Co2", 4: "TVOC", 5: "Light", 6: "Dust"};
    const backend_host = host;
    const [paraFilter, setParaFilter] = useState(1);
    const [nodeIdFilter, setNodeIdFilter] = useState(0);
    const url = `http://${backend_host}/api/v1.1/monitor/data?room_id=${room_id}&filter=${numberOfData}&node_id=${nodeIdFilter}`;

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

        const verifyAccessToken_response = await verifyAccessToken();

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

    // tao ban tin moi
    const get_chart_data = async (url, access_token) => 
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
        if(response.status === 200)
        {
            const data = await response.json();
            const key = ["co2", "temp", "hum", "light", 
            "dust", "sound", "red", "green", 
            "blue", "tvoc", "motion", "time",];
            let newDataChart = {};
            key.forEach((i) => {
                if(i in data)
                {
                    newDataChart[i] = data[i]; 
                }
                else
                {
                    newDataChart[i] = [0];
                }
            })
            setDataChart(newDataChart);
            setIsLoading(false)
        }
        else
        {
            const key = ["co2", "temp", "hum", "light", 
            "dust", "sound", "red", "green", 
            "blue", "tvoc", "motion", "time",];
            let newDataChart = {};
            key.forEach((i) => {
                newDataChart[i] = [0]; 
            })
            setDataChart(newDataChart);
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if(timedelay === 0)
        {
            verify_and_get_data(get_chart_data, callbackSetSignIn, host, url);
        }
        else
        {
            if(dataChart.temp === null)
            {
                verify_and_get_data(get_chart_data, callbackSetSignIn, host, url);
            }
            else
            {
                const timer = setTimeout(()=>{
                    verify_and_get_data(get_chart_data, callbackSetSignIn, host, url);
                }, timedelay);
                return () => clearTimeout(timer);
            }
        }
    },[isLoading, dataChart])

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
                            <FilterNode setNodeIdFilter={setNodeIdFilter}
                                    apiInformationTag={apiInformationTag} 
                                    callbackSetSignIn={callbackSetSignIn}
                                    backend_host={backend_host}
                                    setIsLoadingChart={setIsLoading}
                            />
                            <FilterParameter setParaFilter={setParaFilter}/>
                        </Stack>
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' pr={2} spacing={1}>
                            <SmallFilter setNumberOfData={setNumberOfData} setDataChart={setDataChart} setIsLoading={setIsLoading}/>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
            <Grid style={{ width: '100%'}}>
                {
                    isLoading ? <h1>Loading chart...</h1> :
                    <VictoryLineChart 
                        data_x={dataChart["time"]}
                        data_y={dataChart[para_filter_dict[paraFilter]]}
                        option_data={optionData}
                        parameter_type={paraFilter}
                    />
                }
            </Grid>
        </Grid>
        </>
    );
}

export default Chart;