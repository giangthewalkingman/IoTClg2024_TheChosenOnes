import * as React from 'react';
import { Button, Grid, Typography, Backdrop, Stack } from '@mui/material';
import InputBox from '../../../components/InputBox';
import Paper from '@mui/material/Paper';

const SettingRoom = ({open, selectedRow, widthRef, lengthRef, descriptionRef, handleCancelSettings, handleConfirmSettingRoom, missingType}) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      {selectedRow && (
        <Paper sx={{ padding: '20px', maxWidth: '600px', width: '100%' }}>
          <Typography variant="h3" fontWeight='bold' mb={2} align='center'>
            Change Room Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant='h4' mb={1}>
                Room ID
              </Typography>
              <InputBox
                required
                id={`room_id_settings_${selectedRow.room_id}`}
                name={`room_id_settings_${selectedRow.room_id}`}
                placeholder='Room ID'
                defaultValue={selectedRow.room_id}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='h4' mb={1}>
                Building ID
              </Typography>
              <InputBox
                required
                id={`building_id_settings_${selectedRow.id}`}
                name={`building_id_settings_${selectedRow.id}`}
                placeholder='Building ID'
                defaultValue={selectedRow.building_id}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Width
              </Typography>
              <InputBox
                required
                inputRef={widthRef}
                id={`x_length_settings_${selectedRow.id}`}
                name={`x_length_settings_${selectedRow.id}`}
                placeholder='Width'
                defaultValue={selectedRow.x_length}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Length
              </Typography>
              <InputBox
                required
                inputRef={lengthRef}
                id={`y_length_settings_${selectedRow.id}`}
                name={`y_length_settings_${selectedRow.id}`}
                placeholder='Length'
                defaultValue={selectedRow.y_length}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='h4' mb={1}>
                Description
              </Typography>
              <InputBox
                required
                inputRef={descriptionRef}
                id={`description_settings_${selectedRow.id}`}
                name={`description_settings_${selectedRow.id}`}
                placeholder='Description'
                defaultValue={selectedRow.description}
              />
            </Grid>
            {missingType !== 0 && (
              <Grid item xs={12} pl={1} pt={1} >
                <Typography fontSize='15px' color='red'>
                  Please fill all information
                </Typography>
              </Grid>
            )}
          </Grid>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="secondary" onClick={handleCancelSettings}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirmSettingRoom}>
              Confirm
            </Button>
          </Stack>
        </Paper>
      )}
    </Backdrop>
  )
}

export default SettingRoom;