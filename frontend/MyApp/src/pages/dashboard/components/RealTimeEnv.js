import {
	Grid,
	Typography,
	Paper,
	Button
} from "@material-ui/core";

import ThermostatIcon from '@mui/icons-material/Thermostat';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import InvertColorsIcon from '@mui/icons-material/InvertColors';

const RealTimeEnv = () => {
	const infoData = {
		'temp': 25.3,
		'hum': 72,
		'wind': 0.6,
		'time': 1715286071,
	}

	const dict_of_enviroment_para_names = 
    {
			"temp": {"name":" Temparature", "unit":"°C"}, 
			"hum": {"name":"Humidity", "unit":"%"}, 
			"wind": {"name":"Wind", "unit":"m/s"}, 
    };
	return (
		<Grid container textAlign='center'>
					<Grid container spacing={1} marginY={0.5} marginX={1}>
							<Grid item xs={6}>
									<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
									<Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
											AQI
									</Paper>
									</div>
							</Grid>
							<Grid item xs={6}>
									<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
									<Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
											<Grid container display="flex" flexDirection="column" alignContent='center' alignItems='center' textAlign='center'>
													<Grid item>
															<ThermostatIcon style={{fontSize: '3rem'}}/>
													</Grid>
													<Grid item>
															<Typography textAlign='center' variant='h6'>Temperature</Typography>
															<Typography textAlign='center' variant='h6'>
															{((temp) => {
																	if (infoData["temp"] == 'No data') temp = infoData["temp"];
																	else temp = `${infoData["temp"]} ${dict_of_enviroment_para_names['temp']['unit']}`
																	return temp;
															})()}</Typography>
													</Grid>
											</Grid>
									</Paper>
									</div>
							</Grid>
								<Grid item xs={6}>
										<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
										<Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
												<Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
														<Grid item>
																<InvertColorsIcon style={{fontSize: '3rem'}}/>
														</Grid>
														<Grid item>
																<Typography textAlign='center' variant='h6'>Humidity</Typography>
																<Typography textAlign='center' variant='h6'>{((temp) => {
																		if (infoData["hum"] == 'No data') temp = infoData["hum"];
																		else temp = `${infoData["hum"]} ${dict_of_enviroment_para_names['hum']['unit']}`
																		return temp;
																})()}</Typography>
														</Grid>
												</Grid>
										</Paper>
										</div>
								</Grid>
								
								<Grid item xs={6}>
										<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
										<Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
												<Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
														<Grid item>
																<FilterDramaIcon style={{fontSize: '3rem'}}/>
														</Grid>
														<Grid item>
																<Typography textAlign='center' variant='h6'>Wind</Typography>
																<Typography textAlign='center' variant='h6'>{((temp) => {
																		if (infoData["wind"] == 'No data') temp = infoData["wind"];
																		else temp = `${infoData["wind"]} ${dict_of_enviroment_para_names['wind']['unit']}`
																		return temp;
																})()}</Typography>
														</Grid>
												</Grid>
										</Paper>
										</div>
								</Grid>
						</Grid>
						<Grid xs={12} textAlign='center' spacing={1} margin={1}>
								<Typography textAlign='center' variant='h6'>updated on {
																				(()=>{
																						const new_time = infoData["time"];
																						const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
																						const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
																						const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

																						return formattedDateTime;
																				})()   //run this function
																		}
								</Typography>
						</Grid>
				</Grid>
	)
}

export default RealTimeEnv;