import React, { useState, useEffect } from 'react';
import { Grid, Paper, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Header from '../../../components/Header';
import { host } from '../../../App';
import SettingNode from './SettingNode';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DeleteNode from './DeleteNode';

const NodeList = ({ roomIdForNodeConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [sensorNodeData, setSensorNodeData] = useState([]);
    const [energyNodeData, setEnergyNodeData] = useState([]);
    const [fanNodeData, setFanNodeData] = useState([]);
    const [airNodeData, setAirNodeData] = useState([]);
    const [gatewayData, setGatewayData] = useState([]);
    const [openSetting, setOpenSetting] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState({});
    const [selectedNodeType, setSelectedNodeType] = useState('');

    const node_data_url = `http://${host}/node/getall/${roomIdForNodeConfig}`;

    const handleOpenSetting = (nodeData, type) => {
        setSelectedNodeData(nodeData);
        setSelectedNodeType(type);
        setOpenSetting(true);
    };

    const handleCloseSetting = () => {
        setOpenSetting(false);
    };

    const handleOpenDelete = (nodeData, type) => {
        setSelectedNodeData(nodeData);
        setSelectedNodeType(type);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const TableContent = ({ node_data, type }) => {
		if (node_data.length === 0) return (<></>);
		const props = Object.keys(node_data[0]).filter(key => (key !== 'x_pos_device' && key !== 'y_pos_device' && key !== 'sensor_link'));
	
		return (
			<Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 0 }}>
				<Header title={`All ${type} in room ${roomIdForNodeConfig}`} fontSize="20px" />
				<Table size="small">
					<TableHead>
						<TableRow>
							{props.map((prop, index) => (
								<TableCell key={index} sx={{ fontWeight: 'bold', fontSize: '15px' }}>
									{prop.replace('_', ' ').toUpperCase()}
								</TableCell>
							))}
							<TableCell sx={{ fontWeight: 'bold', fontSize: '15px' }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{node_data.map((row) => (
							<TableRow key={row.id}>
								{props.map((prop, index) => (
									<TableCell key={index} sx={{ fontWeight: '400', fontSize: '13px' }}>
										{row[prop]}
									</TableCell>
								))}
								<TableCell
									sx={{
										width: { xs: '100px', sm: '100px', md: '100px', lg: '100px' },
										'& .MuiInputBase-root': {
											height: 35
										},
									}}
								>
									<Button
										startIcon={<PermDataSettingIcon />}
										sx={{
											backgroundColor: '#ed6c02',
											fontSize: '10px',
											fontWeight: 'bold',
											padding: '5px 12px',
											marginRight: '8px',
										}}
										variant="contained"
										onClick={() => handleOpenSetting(row, type)}
									>
										Setting
									</Button>
								</TableCell>
								<TableCell
									sx={{
										width: { xs: '100px', sm: '100px', md: '100px', lg: '100px' },
										'& .MuiInputBase-root': {
											height: 35
										},
									}}
								>
									<Button
										startIcon={<DeleteIcon />}
										sx={{
											backgroundColor: '#d32f2f',
											fontSize: '10px',
											fontWeight: 'bold',
											padding: '5px 12px',
										}}
										variant="contained"
                                        onClick={() => handleOpenDelete(row, type)}
									>
										Delete
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		)
	}
	

    const get_node_data = async (url) => {
        try {
            const data_response = {
                'sensor': [
                    {
                        "room_id": 1,
                        "gateway_id": 1,
                        "sensor_id": 1,
                        "x_pos": 100,
                        "y_pos": 100,
                    },
                    {
                        "room_id": 1,
                        "sensor_id": 2,
                        "gateway_id": 2,
                        "x_pos": 50,
                        "y_pos": 200,
                    },
                    {
                        "room_id": 1,
                        "sensor_id": 3,
                        "gateway_id": 1,
                        "x_pos": -1,
                        "y_pos": -1,
                    }
                ],
                'energy': [
                    {
                        "room_id": 1,
                        "gateway_id": 1,
                        "em_id": 1,
                        "x_pos": 0,
                        "y_pos": 0,
                    }
                ],
                'fan': [
                    {
                        "room_id": 1,
                        "gateway_id": 1,
                        "fan_id": 1,
                        "x_pos": 20,
                        "y_pos": 400,
                        "model": "manual",
                        'num_device': 0,
                        'num_sensor_link': 1,
                        "sensor_link": '',
                        "x_pos_device": '',
                        "y_pos_device": '',
                    },
                    {
                        "room_id": 1,
                        "gateway_id": 1,
                        "fan_id": 2,
                        "x_pos": -1,
                        "y_pos": -1,
                        "model": "manual",
                        'num_sensor_link': 1,
                        'num_device': 0,
                        "sensor_link": '',
                        "x_pos_device": '',
                        "y_pos_device": '',
                    }
                ],
                'ac': [
                    {
                        "room_id": 1, "gateway_id": 1, "ac_id": 1, 
                        "x_pos": -1, "y_pos": -1,
                        "model": "manual",
                        'num_device': 0,
                        'num_sensor_link': 1,
                        "sensor_link": '',
                        "x_pos_device": '',
                        "y_pos_device": '',
                    }
                ],
                'gateway': [
                    {
                        'gateway_id': 1,
                        'x_pos': 100, 'y_pos': 100,
                        'description': 'Gateway 1',
                    }
                ]
            };

            if (1) {
                const data_json = data_response;
                if (data_json) {
                    setSensorNodeData(data_json.sensor)
                    setEnergyNodeData(data_json.energy)
                    setFanNodeData(data_json.fan)
                    setAirNodeData(data_json.ac)
                    setGatewayData(data_json.gateway)
                    setIsLoading(false)
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
        get_node_data(node_data_url)
    }, [])

    return (
        <Grid container sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto', }} display='flex' rowSpacing={2}>
            <Grid item xs={12}>
                <TableContent node_data={gatewayData} type='gateways' />
            </Grid>
            <Grid item xs={12}>
                <TableContent node_data={sensorNodeData} type='sensors' />
            </Grid>
            <Grid item xs={12}>
                <TableContent node_data={energyNodeData} type='energy sensors' />
            </Grid>
            <Grid item xs={12}>
                <TableContent node_data={fanNodeData} type='fan nodes' />
            </Grid>
            <Grid item xs={12}>
                <TableContent node_data={airNodeData} type='AC nodes' />
            </Grid>
            <SettingNode
                openSetting={openSetting}
                handleClose={handleCloseSetting}
                nodeData={selectedNodeData}
                type={selectedNodeType}
            />
            <DeleteNode 
                openDelete={openDelete}
                handleClose={handleCloseDelete}
                nodeData={selectedNodeData}
                type={selectedNodeType}
            />
        </Grid>
    )
}

export default NodeList;
