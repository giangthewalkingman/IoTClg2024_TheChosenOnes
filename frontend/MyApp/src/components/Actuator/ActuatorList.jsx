import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Typography, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import { styled, Slider } from "@mui/material";
import MuiInput from '@mui/material/Input';

const ActuatorList = ({ actuator }) => {
  const theme = useTheme();
  const [targetValues, setTargetValues] = useState({});
  const [controlModes, setControlModes] = useState({});

  const Circle = styled('div')(({ theme, state }) => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: state === 'on' ? 'green' : 'red',
    display: 'inline-block',
  }));

  const fan_control_mode = [
    { value: 'manual', mode: 'Manual' },
    { value: 'auto', mode: 'Auto' },
    { value: 'hybrid', mode: 'Hybrid' },
  ];

  const air_con_control_mode = [
    { value: 'mode1', mode: 'Mode1' },
    { value: 'mode2', mode: 'Mode2' },
  ];

  const control_mode = actuator === 'air_con' ? air_con_control_mode : fan_control_mode;

  useEffect(() => {
    const initialTargetValues = rows.reduce((acc, row) => {
      acc[row.id] = actuator === 'air_con' ? 15 : 30; // Default target value for Air Conditioner or Actuator
      return acc;
    }, {});
    setTargetValues(initialTargetValues);

    const initialControlModes = rows.reduce((acc, row) => {
      acc[row.id] = actuator === 'air_con' ? 'mode1' : 'manual'; // Default control mode for Air Conditioner or Actuator
      return acc;
    }, {});
    setControlModes(initialControlModes);
  }, [actuator]);

  const handleSliderChange = (id, newValue) => {
    setTargetValues((prevValues) => ({
      ...prevValues,
      [id]: newValue,
    }));
  };

  const handleInputChange = (id, event) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    setTargetValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  const handleBlur = (id) => {
    const minValue = actuator === 'air_con' ? 15 : 0;
    const maxValue = actuator === 'air_con' ? 31 : 100;
    if (targetValues[id] < minValue) {
      setTargetValues((prevValues) => ({
        ...prevValues,
        [id]: minValue,
      }));
    } else if (targetValues[id] > maxValue) {
      setTargetValues((prevValues) => ({
        ...prevValues,
        [id]: maxValue,
      }));
    }
  };

  const handleControlModeChange = (id, mode) => {
    setControlModes((prevModes) => ({
      ...prevModes,
      [id]: mode,
    }));
  };

  const columns = [
    { field: 'id', headerName: (actuator === 'air_con' ? 'AC ID' : 'Fan ID' ), flex: 0.1, align: 'center', headerAlign: 'center' },
    { field: 'value', headerName: (actuator === 'air_con' ? 'Temperature' : 'Speed' ), flex: 0.15, align: 'center', headerAlign: 'center' },
    {
      field: 'set_value',
      headerName: 'Set value',
      flex: 0.25,
      align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={targetValues[params.row.id] || 0}
                onChange={(event, newValue) => handleSliderChange(params.row.id, newValue)}
                min={actuator === 'air_con' ? 15 : 0}
                max={actuator === 'air_con' ? 31 : 100}
                aria-labelledby="input-slider"
              />
            </Grid>
            <Grid item>
              <MuiInput
                sx={{ width: '40px' }}
                value={targetValues[params.row.id] || 0}
                size="small"
                onChange={(event) => handleInputChange(params.row.id, event)}
                onBlur={() => handleBlur(params.row.id)}
                inputProps={{
                  step: 1,
                  min: actuator === 'air_con' ? 15 : 0,
                  max: actuator === 'air_con' ? 31 : 100,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      field: 'control_mode',
      headerName: 'Control Mode',
      flex: 0.4,
      align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction='row' spacing={1} justifyContent='center' alignItems='center'>
          {control_mode.map((value) => (
            <Button
              key={value.value}
              sx={{
                "min-width": "30px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              style={{
                borderColor: controlModes[params.row.id] === value.value ? theme.palette.background.paper : theme.palette.text.primary,
                backgroundColor: controlModes[params.row.id] === value.value ? theme.palette.text.primary : theme.palette.background.paper,
                color: controlModes[params.row.id] === value.value ? theme.palette.background.paper : theme.palette.text.primary,
              }}
              size="small"
              value={value.value}
              variant="outlined"
              onClick={() => handleControlModeChange(params.row.id, value.value)}
            >
              {value.mode}
            </Button>
          ))}
        </Stack>
      ),
    },
    {
      field: 'button',
      headerName: 'Confirm',
      flex: 0.15,
      align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Button
          sx={{
            "min-width": "30px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
          style={{
            borderColor: theme.palette.text.primary,
            color: theme.palette.text.primary,
          }}
          size="small"
          value={params.value}
          variant='outlined'
          onClick={() => {
            console.log(`Submitted value for row ${params.row.id}: ${targetValues[params.row.id]}`);
          }}
        >
          Submit
        </Button>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 0.1,
      align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Circle state='on' />
      ),
    },
  ];

  const rows = [
    { id: 1, value: 10 },
    { id: 2, value: 20 },
    { id: 3, value: 30 },
    { id: 4, value: 40 },
    { id: 5, value: 50 },
    { id: 6, value: 60 },
    { id: 7, value: 70 },
    { id: 8, value: 80 },
    { id: 9, value: 90 },
    { id: 10, value: 110 },
    { id: 11, value: 120 },
  ];

  return (
    <Grid container item px={1} xs={12} lg={6}>
      <Grid container item direction='flex' flexDirection='column'>
        <Grid item textAlign='left' py={2}>
          <Typography variant="h3" fontWeight='bold'>
            {actuator === 'air_con' ? 'Air Conditioner' : 'Fan'}
          </Typography>
        </Grid>
        <Grid item style={{ width: '100%' }} pb={2}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '1.2rem', // Set font size for DataGrid cells
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: '1.4rem', // Set font size for DataGrid cells
                fontWeight: 'bold',
              },
            }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            disableExtendRowFullWidth
            autoHeight
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ActuatorList;
