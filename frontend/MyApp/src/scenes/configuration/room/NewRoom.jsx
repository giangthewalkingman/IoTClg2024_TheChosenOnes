import * as React from 'react';
import { useState } from 'react';
import {
  Grid, Typography, TextField, Stack, Box,
  Button, Backdrop, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InputBox from '../../../components/InputBox';

export default function NewRoom({ setDataCreateRoom }) {
  const theme = useTheme();
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [roomInfo, setRoomInfo] = useState({ x_length: '', y_length: '', description: '' });
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
  }

  const handleSubmit = () => {
    if ((document.getElementById('x_length').value === '')
    || (document.getElementById('y_length').value === '')
    || ((document.getElementById('description').value === '')))
      setMissingType(1)
    else {
      setMissingType(0)
      setRoomInfo({
        x_length: document.getElementById('x_length').value,
        y_length: document.getElementById('y_length').value,
        description: document.getElementById('description').value,
        building_id: 1,
      });
      setOpenBackdrop(true);
    } 
  };

  const handleConfirmSubmit = () => {
    setDataCreateRoom(roomInfo);
    setOpenBackdrop(false);
    setRoomInfo({ x_length: '', y_length: '', description: '' }); // Reset form fields
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
            id="x_length"
            name="x_length"
            placeholder='Width'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
            value={roomInfo.x_length}
            onChange={(e) => setRoomInfo({ ...roomInfo, x_length: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="y_length"
            name="y_length"
            placeholder='Length'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
            value={roomInfo.y_length}
            onChange={(e) => setRoomInfo({ ...roomInfo, y_length: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <InputBox 
            required
            id="description"
            name="description"
            placeholder='Description'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '') }}
            value={roomInfo.description}
            onChange={(e) => setRoomInfo({ ...roomInfo, description: e.target.value })}
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
            Confirm Room Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Width
              </Typography>
              <InputBox 
                required
                id="x_length"
                name="x_length"
                placeholder='Width'
                value={roomInfo.x_length}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Length
              </Typography>
              <InputBox 
                required
                id="y_length"
                name="y_length"
                placeholder='Length'
                value={roomInfo.y_length}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Description
              </Typography>
              <InputBox 
                required
                id="description"
                name="description"
                placeholder='Description'
                value={roomInfo.description}
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
