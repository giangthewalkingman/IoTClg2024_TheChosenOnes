import {
	Grid,
	Typography,
	Paper,
	Button
} from "@material-ui/core";

const RealTimeEnergy = () => {
	const energyData = {
		'voltage': 220.1,
		'current': 4.2,
		'active_power': 293,
		'power_factor': 0.93,
		'frequency': 50,
		'time': 1715286071,
	}

	const define_energy_data = 
    {
			'voltage': {'name': 'Voltage', 'unit': 'V'},
			'current': {'name': 'Current', 'unit': 'A'},
			'active_power': {'name': 'Active Power', 'unit': 'W'},
			'power_factor': {'name': 'Power factor', 'unit': null},
			'frequency': {'name': 'Frequency', 'unit': 'Hz'},
	};

	const colors = ['red', 'blue', 'green', 'orange', 'magenta'];

	const energy_data_property_array = Object.keys(define_energy_data);

	return (
		<Grid container textAlign='center' justifyContent='center'>
			<Grid item container spacing={1} px='10px' marginY={0.5} justifyContent='center'>
					{energy_data_property_array.map((value, index) => {
							if (index < 3)
							return (
									<Grid item xs={4} textAlign='center'>
									<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
									<Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
											<Grid container justifyContent='center' display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
													<Grid container item textAlign='center'>
															<Typography color={colors[0]} fontWeight='bold' variant='h6'>{define_energy_data[value]['name']}</Typography>
													</Grid>
													<Grid item>
															<Typography variant='h6' color={colors[0]}>
																	{((temp) => {
																			if (energyData[value] == 'NULL' || index == 4) temp = energyData[value];
																			else temp = `${energyData[value]} ${define_energy_data[value]['unit']}`
																			return temp;
																	})()}
																	</Typography>
													</Grid>
											</Grid>
									</Paper>
									</div>
							</Grid>
							)
							else
							return (
								<Grid item xs={6}>
								<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
								<Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
										<Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
												<Grid container item justifyContent='center' alignContent='center'>
														<Typography color={colors[0]} fontWeight='bold' variant='h6'>{define_energy_data[value]['name']}</Typography>
												</Grid>
												<Grid item>
														<Typography variant='h6' color={colors[0]}>
																{((temp) => {
																		if (energyData[value] == 'NULL' || index == 3) temp = energyData[value];
																		else temp = `${energyData[value]} ${define_energy_data[value]['unit']}`
																		return temp;
																})()}
																</Typography>
												</Grid>
										</Grid>
								</Paper>
								</div>
						</Grid>
						)
					})}
			</Grid>
			<Grid xs={12} textAlign='center' spacing={1} marginY={1}>
					<Typography textAlign='center' variant='h6'>updated on {
																	(()=>{
																			const new_time = energyData["time"];
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

export default RealTimeEnergy;