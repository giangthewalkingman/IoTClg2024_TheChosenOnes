import * as React from 'react';
import { useState, useContext } from 'react';
import { Container,Button, CssBaseline, Grid, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import NewRoom from './NewRoom';
import RoomList from './RoomList';
import NewGateway from './NewGateway';

export default function RoomConfig({setConfig, setRoomIdForNodeConfig, setRoomSize}) {
    const [reloadRoomConfig, setReloadRoomConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const add_room_data = async (room_data) => {
        const add_room_url = `http://${host}/room/insert`
        try {
            const add_room_response = await fetch(add_room_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(room_data)
            });
      
            if (add_room_response.ok) {
              const add_room_json = await add_room_response.json();
              console.log('Success:', add_room_json);
            } else {
              console.error('Error:', add_room_response.statusText);
            }
          } catch (error) {
            console.error('Error:', error);
          }
    }

    const add_gateway_data = async (gateway_data) => {
      const add_gateway_url = `http://${host}/registration_gateway/update`
      try {
          const add_gateway_response = await fetch(add_gateway_url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(gateway_data)
            });
    
          if (add_gateway_response.status == 200) {
            const add_gateway_json = await add_gateway_response.json();
            alert('Success add gateway!');
          } else {
            alert('Add gateway failed due to unknown MAC address!');
          }
        } catch (error) {
          console.error('Error:', error);
        }
  }

    return (
        <>
        {
        isLoading === true ?
            <h1>Loading ...</h1>
            :
            <Container maxWidth='xl'>
                <React.Fragment>
                <CssBaseline />
                <Grid container columnSpacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ mt: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, boxShadow: 0}}>
                        <Typography variant="h3" fontWeight='bold' align="center" mb={2}>
                            Add new room
                        </Typography>
                        <React.Fragment>
                            <NewRoom setDataCreateRoom={add_room_data}/>
                        </React.Fragment>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ mt: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, boxShadow: 0}}>
                        <Typography variant="h3" fontWeight='bold' align="center" mb={2}>
                            Add new gateway
                        </Typography>
                        <React.Fragment>
                            <NewGateway setDataCreateGateway={add_gateway_data} />
                        </React.Fragment>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <RoomList setConfig={setConfig} setRoomIdForNodeConfig={setRoomIdForNodeConfig} setRoomSize={setRoomSize} />
                  </Grid>
                </Grid>
                </React.Fragment>
            </Container>
            }
            </>
    );
}