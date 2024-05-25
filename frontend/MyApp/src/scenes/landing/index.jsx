import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import DetailsIcon from '@mui/icons-material/Details';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import {host, UserContext} from "../../App";
import plan_409 from "../../assets/409.svg";
import plan_410 from "../../assets/410.svg";
import plan_411 from "../../assets/411.svg";
import { Description } from "@mui/icons-material";

const Landing = () => {
    const callbackSetSignIn = useContext(UserContext);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    /** 
     * @brief state "room_data"
     *          room_data will be a list of dictionary that has a form like this 
     *          [{
     *               "name": `room ${room["id"]} ${room["construction_name"]}`,
     *               "image": image_room[`room_${room["id"]}_${room["construction_name"]}`],
     *               "room_id": room.id,
     *          }, ... ]
     *          When a button is clicked, it will also send the room information to that page. 
     */
    const [room_data, setRoom_data] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const image_room = 
    {
        1: plan_409,
        2: plan_410,
        3: plan_411,
        4: plan_409,
    }

    const backend_host = host;
    const api_room_data = `http://${backend_host}/building/getall`;

    const get_room_data = async (url) => {
        try {
          console.log(`Fetching data from: ${url}`); // Debug: In ra URL để kiểm tra
          const data_response = await fetch(url);
          if (data_response.status === 200) {   
            const data_json = await data_response.json();
            if (data_json) {
              setRoom_data(data_json);
              setIsLoading(false);
            } else {
              alert('No room data!');
            }
          } else {
            alert(`Cannot call to server! Error code: ${data_response.status}`);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          alert('Failed to fetch data from server.');
        }
      };
      
    useEffect(()=>{
        get_room_data(api_room_data);
    },[]);

    
    return (
        <Box p="20px" sx={{ backgroundColor: theme.palette.background.default}}>
            <main>
            <Container sx={{ py: 6 }} maxWidth="xl">    {/* This container is the most ouside*/}
                <Grid container spacing={5}>            {/* This Grid container is the one that make every child Grid inside in order*/}
                {
                    isLoading ? 
                    <h1>Loading...</h1>
                    :
                    <>
                    {
                    room_data.map((room) => (
                        // This function return an array of Grid component       
                        <Grid item key={room.name} xs={12} sm={12} xl={3}
                                md={
                                    (() => {
                                        const room_data_length = room_data.length;
                                        if (room_data_length === 1) return 12;
                                        else if (room_data_length === 2) return 6;
                                        else return 4;
                                    })()
                                }
                        >
                        {/* xs=collum's width sm={16} md={4} */}
                            <Card
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                            <Box
                                container
                                display="flex"
                                flexDirection="row"
                                // alignItems="center"
                                justifyContent="center"
                                height="350px"
                                sx={{
                                    "object-fit": "cover",
                                    // backgroundColor: "blue",
                                }}
                            >
                                <img src={image_room[1]} alt="" />
                            </Box>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h4" component="h2" sx={{fontWeight: "bold"}}>
                                    {room.name}
                                </Typography>
                                <Typography gutterBottom variant="h5" component="h3" sx={{fontWeight: 600}}>
                                    {room.location}
                                </Typography>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>
                                        Click the button below for more information!
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Link to="/landing/dashboard" 
                                    state= {room}
                                >
                                    <Button 
                                        size="small"
                                        sx={{
                                            backgroundColor: "black",
                                            color: "white",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "5px 8px",
                                        }}
                                        >
                                        <DetailsIcon sx={{ mr: "10px" }} />
                                        Detail   
                                    </Button>
                                    {/* <Button size="small">View</Button>
                                    <Button size="small">Edit</Button> */}
                                </Link>
                            </CardActions>
                            </Card>
                        </Grid>
                    ))
                    }
                    </>
                }
                </Grid>
                </Container>
            </main>
            {/* End body */}

        </Box>
    )
}

export default Landing;