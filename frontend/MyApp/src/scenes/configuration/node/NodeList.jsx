import React, { useState, useEffect } from 'react';
import { Grid, Paper, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Header from '../../../components/Header';
import { host } from '../../../App';
import SettingNode from './SettingNode';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DeleteNode from './DeleteNode';

const NodeList = ({ roomIdForNodeConfig }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sensorNodeData, setSensorNodeData] = useState([{"gateway_id": null, "sensor_id": null, "x_pos": null, "y_pos": null,}]);
    const [energyNodeData, setEnergyNodeData] = useState([{"em_id": null, "room_id": null, "x_pos": null, "y_pos": null,}]);
    const [fanNodeData, setFanNodeData] = useState([{"gateway_id": null, "fan_id": null, "x_pos": null, "y_pos": null, "model": null, 'num_device': null,
                                                'num_sensor_link': null, "sensor_link": '', "x_pos_device": '', "y_pos_device": null,}]);
    const [airNodeData, setAirNodeData] = useState([{"gateway_id": null, "ac_id": null, "x_pos": null, "y_pos": null, "model": null, 'num_device': null,
                                                'num_sensor_link': null, "sensor_link": '', "x_pos_device": '', "y_pos_device": null,}]);
    const [gatewayData, setGatewayData] = useState([{'gateway_id': null, 'x_pos': null, 'y_pos': null, 'description': null,}]);
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
        setIsLoading(true)
    };

    const handleOpenDelete = (nodeData, type) => {
        setSelectedNodeData(nodeData);
        setSelectedNodeType(type);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setIsLoading(true);
    };

    const TableContent = ({ node_data, type }) => {
        // if (isLoading === true) return <h1>Loading...</h1>
		const props = node_data !== undefined ? Object.keys(node_data[0]).filter(key => (key !== 'x_pos_device' && key !== 'y_pos_device' && key !== 'sensor_link')) : [];
        if (node_data !== undefined)
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
        else return <h1>Error</h1>
	}
	

    const get_node_data = async (url) => {
        try {
            const data_response = await fetch(url)
            if (data_response.status === 200) {
                const data_json = await data_response.json();
                if (data_json) {
                    const countDigitsInString = (inputString) => {
                        let numbers = inputString.split(", ");
                        let digitCount = 0;
                        for (let number of numbers) {
                            digitCount += number.trim().length;
                        }
                        return digitCount;
                    }

                    for (let item of data_json.fan) {
                        let numbers = item.sensor_link.split(", ");
                        let digitCount = 0;
                        for (let number of numbers) {
                            digitCount += number.trim().length;
                        }
                        item.num_sensor_link = digitCount
                        digitCount = 0;
                        for (let number of numbers) {
                            digitCount += number.trim().length;
                        }
                        item.num_device = digitCount
                    }
                    for (let item of data_json.ac) {
                        let numbers = item.sensor_link.split(", ");
                        let digitCount = 0;
                        for (let number of numbers) {
                            digitCount += number.trim().length;
                        }
                        item.num_sensor_link = digitCount
                        digitCount = 0;
                        for (let number of numbers) {
                            digitCount += number.trim().length;
                        }
                        item.num_device = digitCount
                    }
                    setSensorNodeData(data_json.sensor)
                    setEnergyNodeData(data_json.em)
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
        // if (isLoading) {
        //     get_node_data(node_data_url)
        //   } else {
        //     const timer = setTimeout(() => {
        //         get_node_data(node_data_url)
        //     }, 10000);
        //     return () => clearTimeout(timer);
        //   }
    }, [isLoading])

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
