import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import plan_409 from "../../assets/409.svg";
import plan_410 from "../../assets/410.svg";
import plan_411 from "../../assets/411.svg";
import { React, useState, useEffect } from "react";

import HeatmapComponent from "./HeatmapComponent";

/**
 * @brief This component RoomMap will render out the image room with all node 
 *          sticks to it in real position according to the x and y axises provided
 *          in database backend.
 */
const RoomMap = ({room_id, callbackSetSignIn, backend_host, map_length, heatMapView}) => 
{
    const [heatMapData, setHeatMapData] = useState({'sensor' : null, 'room': null});
    const [sensorPos, setSensorPos] = useState([]);
    const [energyPos, setEnergyPos] = useState([]);
    const [fanPos, setFanPos] = useState([]);
    const [airPos, setAirPos] = useState([]);
    const [showHeatmap, setShowHeatmap] = useState(heatMapView);
    const theme = useTheme();
    
    /**
     * @brief nodePosition is an array of all node in this room with informations,
     *        the information will contains whether it is sensor or actuator, the positions
     *        of it according to the real size of the box it is gonna be rendered, which is    
     *        the "px" from left and the "px" from above.
     *        The image of the room will be positioned so that the main door will facing above,
     *        the left of the room will be the x_axis and the bottom of the room will be the y_axis.
     *        The array will be like:
     *        [{"node_id": ..., "function": ..., "node_left": ..., "node_above": ...}, ...]
     * 
     *  node_info -> sensor(array 7) -> x_axis, y_axis, node_id
     */
    const[isLoading, setIsLoading] = useState(false);
    // const api_to_fetch = `http://${backend_host}/api/room/information_tag?room_id=${room_id}`;
    const heatmap_data_url = `http://${backend_host}/heatmap?room_id=${room_id}/sensor`;
    const node_position_url = `http://${backend_host}/heatmap?room_id=${room_id}/allnode`;

    const dict_plan = {
        1: plan_409,
        2: plan_410,
        3: plan_409,
        4: plan_411,
    }

    const get_heatmap_data = async (heatmap_url, node_url) =>
    {
        try {
        // const heatmap_data_response = await fetch(heatmap_url);
        // const node_position_response = await fetch(node_url);
        const heatmap_data_response = {
            'sensor': [
                {
                    'sensor_id': 1,
                    'temp': 24.3,
                    'x_axis': 10,
                    'y_axis': 50,
                },
                {
                    'sensor_id': 2,
                    'temp': 25.3,
                    'x_axis': 100,
                    'y_axis': 100,
                },
                {
                    'sensor_id': 3,
                    'temp': 26.7,
                    'x_axis': 300,
                    'y_axis': 400,
                },
            ],
            'room': {
                'x_length': 300,
                'y_length': 500,
            }
        }
        const node_position_response = {
            'sensor': [
                {
                    'sensor_id': 1,
                    'x_axis': 10,
                    'y_axis': 50,
                },
                {
                    'sensor_id': 2,
                    'x_axis': 100,
                    'y_axis': 100,
                },
                {
                    'sensor_id': 3,
                    'x_axis': 300,
                    'y_axis': 400,
                },
            ],
            'energy': [{
                'em_id': 1,
                'x_axis': 0,
                'y_axis': 0,
            },],
            'fan': [
                {
                    'fan_id': 1,
                    'x_axis': 0,
                    'y_axis': 500,
                },
                {
                    'fan_id': 2,
                    'x_axis': 300,
                    'y_axis': 0,
                },
            ],
            'ac': [{
                'ac_id': 1,
                'x_axis': 0,
                'y_axis': 250,
            },],
        }
        // if ((heatmap_data_response.status === 200) && (node_position_response.status === 200)) {   
        if (1) {   
        //   const heatmap_data_json = await heatmap_data_response.json();
        //   const node_position_json = await node_position_response.json();
        const heatmap_data_json = heatmap_data_response;
        const node_position_json = node_position_response;
          if (heatmap_data_json && node_position_json) {
            let x_length = heatmap_data_json.room.x_length;
            let y_length = heatmap_data_json.room.y_length;
            let heatmap_data = [];
            let sensor_pos = [];
            let energy_pos = [];
            let fan_pos = [];
            let ac_pos = [];
            for (let item of heatmap_data_json.sensor) {
                let newObj = {
                    x: Math.floor(item.x_axis * map_length.x / x_length),
                    y: Math.floor(item.y_axis * map_length.y / y_length),
                    value: Math.round(item.temp),
                    radius: 350,
                }
                heatmap_data.push(newObj);
            }
            for (let item of node_position_json.sensor) {
                let newObj = {
                    id: item.sensor_id,
                    x: Math.floor(item.x_axis * map_length.x / x_length),
                    y: Math.floor(item.y_axis * map_length.y / y_length),
                }
                sensor_pos.push(newObj);
            }
            for (let item of node_position_json.energy) {
                let newObj = {
                    id: item.em_id,
                    x: Math.floor(item.x_axis * map_length.x / x_length),
                    y: Math.floor(item.y_axis * map_length.y / y_length),
                }
                energy_pos.push(newObj);
            }
            for (let item of node_position_json.fan) {
                let newObj = {
                    id: item.fan_id,
                    x: Math.floor(item.x_axis * map_length.x / x_length),
                    y: Math.floor(item.y_axis * map_length.y / y_length),
                }
                fan_pos.push(newObj);
            }
            for (let item of node_position_json.ac) {
                let newObj = {
                    id: item.ac_id,
                    x: Math.floor(item.x_axis * map_length.x / x_length),
                    y: Math.floor(item.y_axis * map_length.y / y_length),
                }
                ac_pos.push(newObj);
            }
            setHeatMapData(heatmap_data);   
            setSensorPos(sensor_pos);
            setEnergyPos(energy_pos);
            setFanPos(fan_pos);
            setAirPos(ac_pos);
            setIsLoading(false);
          } else {
            alert('No heatmap data!');
          }
        } else {
            if (heatmap_data_response.status !== 200)
                alert(`Cannot call to server! Error code: ${heatmap_data_response.status}`);
            else
                alert(`Cannot call to server! Error code: ${node_position_response.status}`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data from server.');
      }
    }

    useEffect(()=>{
        if(heatMapData.sensor === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
        {
            get_heatmap_data(heatmap_data_url, node_position_url)
        }
        else
        {
            const timer = setTimeout(()=>{
                get_heatmap_data(heatmap_data_url, node_position_url)
                }, 60000);
            return () => clearTimeout(timer);
        }
    },[]);

    return (
        <>
        {
            isLoading ? <h1>Loading...</h1> :
            <Grid container justifyContent='center' justifyItems='center'>
                <Grid item xs={12} sm={12} md={12} textAlign="center" >
                    <Typography fontWeight="bold" fontSize='21px'>
                        Map view
                    </Typography>
                </Grid>
                <Grid item xs={12} p={1} />
                <Grid container item xs={12} justifyContent='center'>
                    <HeatmapComponent
                        heatMapData={heatMapData}
                        sensorPos={sensorPos}
                        energyPos={energyPos}
                        fanPos={fanPos}
                        airPos={airPos}
                        pic_src={dict_plan[1]}
                        showHeatmap={showHeatmap}
                        map_length={map_length}
                    />
                </Grid>
                <Grid item container justifyContent='center' xs={12} marginY={3}>
                    <Button size="large" variant='outlined' sx={{borderColor: theme.palette.text.primary}}
                        onClick={() => {
                            setShowHeatmap(!showHeatmap);
                        }}>
                        <Typography variant='h4' fontWeight='bold' color={theme.palette.text.primary}>
                            {showHeatmap ? 'Heatmap OFF' : 'Heatmap ON'}
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
        }
        </>
    );
}


export default RoomMap;
