import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/system';
import h337 from 'heatmap.js';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline } from '@mui/icons-material';
import SensorsIcon from '@mui/icons-material/Sensors';
import AirIcon from '@mui/icons-material/Air';
import WindPowerIcon from '@mui/icons-material/WindPower';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

const HeatmapComponent = ({heatMapData, sensorPos, energyPos, fanPos, airPos, pic_src, showHeatmap, map_length}) => {
  const HeatmapContainer = styled('div')({
    position: 'relative',
    width: map_length.x,
    height: map_length.y,
  });
  
  const HeatmapImg = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    opacity: showHeatmap ? '0%' : '100%',
  });
  
  const HeatmapOverlay = styled('div')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: showHeatmap ? '100%' : '0%',
  });

  const heatmapRef = useRef(null);
  
  const SensorButton = styled(IconButton)({
    border: '1px solid', // Add border to create an outlined effect
    borderRadius: '50%', // Ensure the button is circular
    padding: '8px', // Add padding to adjust the size of the button as needed
    fontSize: '3rem',
    position: 'absolute',
    '& .MuiButton-startIcon': {
      position: 'relative',
    },
    '& .sensor-label': {
      position: 'absolute',
      top: '50px',
      right: '0px',
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    },
  });

  useEffect(() => {
    const heatmapInstance = h337.create({
      container: heatmapRef.current,
    });

    const data = {
      max: 60,
      data: heatMapData,
    };

    heatmapInstance.setData(data);
  }, [heatMapData, showHeatmap]);

  return (
    <HeatmapContainer>
      <HeatmapImg src={pic_src} alt="Map view" />
      <HeatmapOverlay ref={heatmapRef} />
      {sensorPos.map((sensor, index) => (
          <SensorButton
            size='large'
            key={index}
            variant="contained"
            color="primary"
            style={{ top: sensor.y - 25, left: sensor.x - 25, backgroundColor: 'white' }} 
            startIcon={<AddCircleOutline />}
          >
            <SensorsIcon fontSize='inherit' />
            <span className="sensor-label">{sensorPos[index].id}</span>
          </SensorButton>
      ))}
      {energyPos.map((sensor, index) => (
          <SensorButton
            size='large'
            key={index}
            variant="contained"
            color="primary"
            style={{ top: sensor.y - 25, left: sensor.x - 25, backgroundColor: 'chartreuse' }} 
            startIcon={<AddCircleOutline />}
          >
            <ElectricBoltIcon fontSize='inherit' />
            <span className="sensor-label">{energyPos[index].id}</span>
          </SensorButton>
      ))}
      {fanPos.map((sensor, index) => (
          <SensorButton
            size='large'
            key={index}
            variant="contained"
            color="primary"
            style={{ top: sensor.y - 25, left: sensor.x - 25, backgroundColor: 'aqua' }} 
            startIcon={<AddCircleOutline />}
          >
            <WindPowerIcon fontSize='inherit' />
            <span className="sensor-label">{fanPos[index].id}</span>
          </SensorButton>
      ))}
      {airPos.map((sensor, index) => (
          <SensorButton
            size='large'
            key={index}
            variant="contained"
            color="primary"
            style={{ top: sensor.y - 25, left: sensor.x - 25, backgroundColor: 'orange' }} 
            startIcon={<AddCircleOutline />}
          >
            <AirIcon fontSize='inherit' />
            <span className="sensor-label">{airPos[index].id}</span>
          </SensorButton>
      ))}
      
    </HeatmapContainer>
  );
};

export default HeatmapComponent;