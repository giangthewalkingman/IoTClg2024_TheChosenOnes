import { Box, Button, Backdrop, Stack, Typography, Paper, TextField } from "@mui/material";
import InputBox from "../InputBox";
import { useTheme } from "@emotion/react";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import { host } from "../../App";

const EnvPMV = ({ room_id }) => {
	const theme = useTheme()
	const [envPMVdata, setEnvPMVdata] = useState({});
	const [openBackdrop, setOpenBackdrop] = useState(false)
	const url = `http://${host}/pmv/control/${room_id}`
	const [missingType, setMissingType] = useState(0);
	const MissingInfo = ({missingType}) => {
		if (missingType === 0) return <></>;
		if (missingType === 1)
		return (
			<Typography fontSize='15px' color='red'>
					Please fill all field
			</Typography>
		)
		else return (
			<Typography fontSize='15px' color='red'>
					Invalid value
			</Typography>
		)
	}
	const send_env_pmv = async (data, url) => {
		try {
				const send_data_request = await fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(data)
					});
	
				if (send_data_request.status == 200) {
					alert('Sent environment settings successfully!');
				} else {
					alert('Sent data failed!');
				}
			} catch (error) {
				console.error('Error:', error);
			}
	}
	return (
		<Box
				px={1} py={1}
				sx={{boxShadow: 0,
						borderRadius: '5px', 
						backgroundColor: theme.palette.background.paper}}
				width="100%" height="100%" display="flex" alignContent="center" justifyContent="center"
		>
				<Grid container>
						<Grid item xs={12} md={6} alignContent='center'>
								<Typography variant="h3" fontWeight='bold'>
										Room environment settings
								</Typography>
						</Grid>
						<Grid item xs={12} md={6} alignContent='center'>
								<Stack direction={{xs: 'column', md: 'row'}} justifyContent='flex-end' alignItems='center' spacing={3}>
										<MissingInfo missingType={missingType} />
										<InputBox
                        required
                        id='met'
                        name="met"
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9.]/g, '') }}
                        placeholder='Metabolic rate'
                    />
										<InputBox
                        required
                        id='clo'
                        name="clo"
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9.]/g, '') }}
                        placeholder='Clothing insulation'
                    />
										<InputBox
                        required
                        id='pmv_ref'
                        name="pmv_ref"
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9.]/g, '') }}
                        placeholder='PMV reference'
                    />
										<Button
												sx={{
														"min-width": "30px",
														fontSize: "16px",
														fontWeight: "bold",
												}}
												style={{
														borderColor: theme.palette.background.paper,
														backgroundColor: theme.palette.text.primary,
														color: theme.palette.background.paper,
												}}
												size="small"
												onClick={() => {
													if (document.getElementById('met').value === '' || document.getElementById('clo').value === '' || document.getElementById('pmv_ref').value === '')
														setMissingType(1)
													else {
														const decimalRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
														if (decimalRegex.test(document.getElementById('met').value) && decimalRegex.test(document.getElementById('clo').value) && decimalRegex.test(document.getElementById('pmv_ref').value)) {
															setMissingType(0)
															setEnvPMVdata({
																'met': document.getElementById('met').value,
																'clo': document.getElementById('clo').value,
																'pmv_ref': document.getElementById('pmv_ref').value,
															})
															setOpenBackdrop(true)
														}
														else
															setMissingType(2)
													}
												}}
										>
												Set
										</Button>
								</Stack>
								<Backdrop
									sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
									open={openBackdrop}
								>
									<Paper sx={{ padding: '20px', maxWidth: '600px', width: '100%' }}>
											<Typography variant="h3" fontWeight='bold' mb={2} align='center'>
													Confirm settings
											</Typography>
											<Typography variant='h4'>
													<b>Metabolic rate:</b> {envPMVdata.met}
											</Typography>
											<Typography variant='h4'>
													<b>Clothing insulation:</b> {envPMVdata.clo}
											</Typography>
											<Typography variant='h4'>
													<b>PMV reference:</b> {envPMVdata.pmv_ref}
											</Typography>
											<Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
													<Button variant="contained" color="secondary" onClick={() => {
														setOpenBackdrop(false)
													}}>
															Cancel
													</Button>
													<Button variant="contained" color="primary" onClick={() => {
														setOpenBackdrop(false)
														send_env_pmv(envPMVdata, url)
													}}>
															Confirm
													</Button>
											</Stack>
									</Paper>
								</Backdrop>
						</Grid>
				</Grid>
		</Box>     
	)
}

export default EnvPMV;