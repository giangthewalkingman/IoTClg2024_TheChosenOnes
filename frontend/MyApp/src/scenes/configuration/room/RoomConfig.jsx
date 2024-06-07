import * as React from 'react';
import { useState, useContext } from 'react';

import { Container,Button, CssBaseline, Box, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import NewRoom from './NewRoom';
import RoomList from './RoomList';

export default function RoomConfig({setConfig, setRoomIdForNodeConfig, setRoomSize}) {
    const [reloadRoomConfig, setReloadRoomConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const add_room_data = async (room_data, gateway_data) => {
        const add_room_url = `http://${host}/room/insert`
        const add_gateway_url = `http://${host}/registration_gateway/insert`
        console.log('HERE')
        console.log(room_data)
        console.log(gateway_data)
        try {
            const add_room_response = await fetch(add_room_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(room_data)
            });

            const add_gateway_response = await fetch(add_gateway_url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(gateway_data)
              });
      
            if (add_gateway_response.ok && add_room_response.ok) {
              const add_room_json = await add_room_response.json();
              const add_gateway_json = await add_gateway_response.json();
              console.log('Success:', add_room_json);
            } else {
              console.error('Error:', add_gateway_response.statusText);
              console.error('Error:', add_room_response.statusText);
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
                <Container maxWidth="sm" sx={{ mb: 2 }}>
                    <Paper sx={{ mt: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, boxShadow: 0}}>
                        <Typography variant="h3" fontWeight='bold' align="center" mb={2}>
                            Add new room
                        </Typography>
                        <React.Fragment>
                            <NewRoom setDataCreateRoom={add_room_data}/>
                        </React.Fragment>
                    </Paper>
                </Container>
                </React.Fragment>
                <RoomList setConfig={setConfig} setRoomIdForNodeConfig={setRoomIdForNodeConfig} setRoomSize={setRoomSize} />
            </Container>
            }
            </>
    );
}