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
  const [roomInfo, setRoomInfo] = useState({ room_id: '', x_length: '', y_length: '', description: '' });

  const handleSubmit = () => {
    setRoomInfo({
      room_id: document.getElementById('room_id').value,
      x_length: document.getElementById('x_length').value,
      y_length: document.getElementById('y_length').value,
      description: document.getElementById('description').value,
      building_id: 1,
    });
    setOpenBackdrop(true);
  };

  const handleConfirmSubmit = () => {
    setDataCreateRoom(roomInfo);
    setOpenBackdrop(false);
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
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="x_length"
            name="x_length"
            placeholder='Width'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="y_length"
            name="y_length"
            placeholder='Length'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputBox 
            required
            id="description"
            name="description"
            placeholder='Description'
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
          />
        </Grid>
      </Grid>
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
          <Typography variant="h4" gutterBottom>
            Confirm Room Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Room ID"
                value={roomInfo.room_id}
                fullWidth
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Width"
                value={roomInfo.x_length}
                fullWidth
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Length"
                value={roomInfo.y_length}
                fullWidth
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                value={roomInfo.description}
                fullWidth
                variant="standard"
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