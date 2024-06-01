import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Header from '../../../components/Header';
import { Button, Grid } from '@mui/material';
import Paper from '@mui/material/Paper';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DetailsIcon from '@mui/icons-material/Details';

const NodeList = ({roomIdForNodeConfig}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sensorNodeData, setSensorNodeData] = useState([]);
  const [energyNodeData, setEnergyNodeData] = useState([]);
	const [fanNodeData, setFanNodeData] = useState([]);
	const [airNodeData, setAirNodeData] = useState([]);
	const [gatewayData, setGatewayData] = useState([]);
  const node_data_url = `http://${host}/node/getall/${roomIdForNodeConfig}`;

	const TableContent = ({ node_data, type }) => {
		if (node_data.length === 0) return(<></>);
		const props = Object.keys(node_data[0]);

		return (
			<Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 0 }}>
          <Header title={`All ${type} in room ${roomIdForNodeConfig}`} fontSize="20px"/>
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
											startIcon={<DetailsIcon />}
											sx={{
												backgroundColor: '#1976d2',
												fontSize: '10px',
												fontWeight: 'bold',
												padding: '5px 12px',
											}}
											variant="contained"
										>
											Detail
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
											startIcon={<PermDataSettingIcon />}
											sx={{
												backgroundColor: '#ed6c02',
												fontSize: '10px',
												fontWeight: 'bold',
												padding: '5px 12px',
											}}
											variant="contained"
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
  
  const get_node_data = async (url) => 
    {
        try {
            // const data_response = await fetch(url);
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
									"em_id": 1,
									"room_id": 1,
									"gateway_id": 1,
									"x_pos": 0,
									"y_pos": 0,
								}
							],
							'fan': [
								{
									"fan_id": 1,
									"room_id": 1,
									"gateway_id": 1,
									"x_pos": 20,
									"y_pos": 400,
									"model": "manual",
									"sensor_link": [],
									"x_pos_device": [],
									"y_pos_device": [],
								},
								{
									"fan_id": 2,
									"room_id": 1,
									"gateway_id": 1,
									"x_pos": -1,
									"y_pos": -1,
									"model": "manual",
									"sensor_link": [],
									"x_pos_device": [],
									"y_pos_device": [],
								}
							],
							'ac': [
								{
									"ac_id": 1, "room_id": 1, "x_pos": -1, "y_pos": -1, "gateway_id": 1,
									"model": "manual",
									"sensor_link": [],
									"x_pos_device": [],
									"y_pos_device": [],
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
            // if (data_response.status === 200) {   
            if (1) {   
            //   const data_json = await data_response.json();
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
    },[])

  return (
    <Grid container sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto', }} display='flex' spacing={2} m={0}>
      <Grid item xs={12}>
        <TableContent node_data={gatewayData} type='gateways'/>
      </Grid>
      <Grid item xs={12}>
				<TableContent node_data={sensorNodeData} type='sensors'/>
      </Grid>
			<Grid item xs={12}>
				<TableContent node_data={energyNodeData} type='energy sensors'/>
      </Grid>
			<Grid item xs={12}>
				<TableContent node_data={fanNodeData} type='fan nodes'/>
      </Grid>
			<Grid item xs={12}>
				<TableContent node_data={airNodeData} type='AC nodes'/>
      </Grid>
    </Grid>
  )
}

export default NodeList;