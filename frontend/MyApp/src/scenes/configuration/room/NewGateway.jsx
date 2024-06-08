import * as React from 'react';
import { useState } from 'react';
import {
  Grid, Typography, TextField, Stack, Box,
  Button, Backdrop, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InputBox from '../../../components/InputBox';

export default function NewGateway({ setDataCreateGateway }) {
  const theme = useTheme();
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [gatewayInfo, setgatewayInfo] = useState({ x_pos: '', y_pos: '', mac: '', room_id: '' });
  const [missingType, setMissingType] = useState(0);
  
  const MissingInfo = ({missingType}) => {
      if (missingType === 0) return <></>;
      if (missingType === 1)
      return (
				<Grid item xs={12} pl={1} pt={1} >
						<Typography fontSize='15px' color='red'>
								Please fill all information
						</Typography>
				</Grid>
      )
			else return (
				<Grid item xs={12} pl={1} pt={1} >
						<Typography fontSize='15px' color='red'>
								Invaild {(missingType === 2) ? 'room ID' : 'MAC address'}
						</Typography>
				</Grid>
			)
  }

	function isValidMACAddress(mac) {
    // Regular expression for validating MAC address
    const macRegex = /^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
	}

  const handleSubmit = () => {
    if ((document.getElementById('mac').value === '')
		|| (document.getElementById('room_id').value === ''))
      setMissingType(1)
		else if (document.getElementById('room_id').value === '0')
			setMissingType(2)
		else if (isValidMACAddress(document.getElementById('mac').value) === false)
			setMissingType(3)
    else {
      setMissingType(0)
      setOpenBackdrop(true);
    } 
  };

  const handleConfirmSubmit = () => {
    setDataCreateGateway(gatewayInfo);
    setOpenBackdrop(false);
    setgatewayInfo({ x_pos: '', y_pos: '', mac: '', room_id: '' }); // Reset form fields
  };

  const handleCancelSubmit = () => {
    setOpenBackdrop(false);
  };

  return (
    <React.Fragment>
      <Grid container spacing={3}>
				<Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="room_id"
            name="room_id"
            placeholder='Room ID'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
            value={gatewayInfo.room_id}
            onChange={(e) => setgatewayInfo({ ...gatewayInfo, room_id: e.target.value })}
          />
        </Grid>
				<Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="mac"
            name="mac"
            placeholder='Mac'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9:]/g, '') }}
            value={gatewayInfo.mac}
            onChange={(e) => setgatewayInfo({ ...gatewayInfo, mac: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="x_pos"
            name="x_pos"
            placeholder='X Position'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
            value={gatewayInfo.x_pos}
            onChange={(e) => setgatewayInfo({ ...gatewayInfo, x_pos: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="y_pos"
            name="y_pos"
            placeholder='Y Position'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
            value={gatewayInfo.y_pos}
            onChange={(e) => setgatewayInfo({ ...gatewayInfo, y_pos: e.target.value })}
          />
        </Grid>
      </Grid>
      <MissingInfo missingType={missingType}/>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          sx={{ ml: 1 }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
      >
        <Paper sx={{ padding: '20px', maxWidth: '600px', width: '100%' }}>
          <Typography variant="h3" fontWeight='bold' mb={2} align='center'>
            Confirm Gateway Information
          </Typography>
          <Grid container spacing={3}>
						<Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Room ID
              </Typography>
              <InputBox 
                required
								id="room_id"
								name="room_id"
								placeholder='Room ID'
                value={gatewayInfo.room_id}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
						<Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Mac
              </Typography>
              <InputBox 
                required
                id="mac"
                name="mac"
                placeholder='Mac'
                value={gatewayInfo.mac}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                X Position
              </Typography>
              <InputBox 
                required
                id="x_pos"
                name="x_pos"
                placeholder='X Position'
                value={gatewayInfo.x_pos}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Y Position
              </Typography>
              <InputBox 
                required
                id="y_pos"
                name="y_pos"
                placeholder='Y Position'
                value={gatewayInfo.y_pos}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="secondary" onClick={handleCancelSubmit}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirmSubmit}>
              Confirm
            </Button>
          </Stack>
        </Paper>
      </Backdrop>
    </React.Fragment>
  );
}
