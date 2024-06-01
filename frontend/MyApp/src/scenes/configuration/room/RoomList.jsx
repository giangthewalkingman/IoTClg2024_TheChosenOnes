import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Header from '../../../components/Header';
import { Button, Grid } from '@mui/material';
import Paper from '@mui/material/Paper';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DetailsIcon from '@mui/icons-material/Details';

const RoomList = ({setConfig, setRoomIdForNodeConfig, setRoomSize}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const room_data_url = `http://${host}/room/getall`;
  const building_data_url = `http://${host}/building/getall`;
  
  const get_information_data = async (room_data_url, building_data_url) => 
    {
      try {
      // const room_data_response = await fetch(room_data_url);
      // const building_data_response = await fetch(building_data_url);
      const room_data_response = [
        {
          "building_id": 1,
          "description": "Room 1",
          "room_id": 1,
          "x_length": 300.0,
          "y_length": 500.0
        }
      ]
      const building_data_response = [
        {
          "building_id": 1,
          "location": "Hanoi",
          "name": "Building 1"
        }
      ]
      // if ((room_data_response.status === 200) && (building_data_response.status === 200)) {   
      if (1) {   
      //   const room_data_json_= await room_data_response.json();
      //   const building_data_json = await building_data_response.json();
        const room_data_json = room_data_response;
        const building_data_json = building_data_response;
        if (room_data_json && building_data_json) {
          setRoomData(room_data_json);
          setBuildingData(building_data_json);
          setIsLoading(false);
        } else {
          alert('No info data!');   
        }
      } else {
          if (room_data_response.status !== 200)
              alert(`Cannot call to server! Error code: ${room_data_response.status}`);
          else
              alert(`Cannot call to server! Error code: ${building_data_response.status}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data from server.');
    }
  }

  useEffect(() => {
    if (isLoading === true) {
      get_information_data(room_data_url, building_data_url)
    }
    else {
      const timer = setTimeout(()=>{
          get_information_data(room_data_url, building_data_url)
      }, 10000);
      return () => clearTimeout(timer);
    }
  },[]);

  return (
    <Grid container display='flex' spacing={2} m={0}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 0 }}>
          <Header title="All building records" fontSize="20px"/>
          <Table size="small">
              <TableHead>
                  <TableRow>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Building ID</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Name</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Location</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}></TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {buildingData.map((row) => (
                  <TableRow key={row.id}>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.building_id}</TableCell>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.name}</TableCell>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.location}</TableCell>
                      <TableCell 
                          sx={{
                              width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                    "& .MuiInputBase-root": {
                                        height: 35
                                    },
                                  }}
                      >
                          <Button
                              startIcon={<DetailsIcon />}
                              sx={{
                                  backgroundColor: "#1976d2",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  padding: "5px 12px",
                                  }}
                              variant="contained"
                          >
                              Detail
                          </Button>
                      </TableCell>
                      <TableCell 
                          sx={{
                              width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                    "& .MuiInputBase-root": {
                                        height: 35
                                    },
                                  }}
                      >
                          <Button
                              startIcon={<PermDataSettingIcon />}
                              sx={{
                                  backgroundColor: "#ed6c02",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  padding: "5px 12px",
                                  }}
                              variant="contained"
                          >
                              Setting
                          </Button>
                      </TableCell>
                      <TableCell 
                          sx={{
                              width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                    "& .MuiInputBase-root": {
                                        height: 35
                                    },
                                  }}
                      >
                          <Button
                              startIcon={<DeleteIcon />}
                              sx={{
                                  backgroundColor: "#d32f2f",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  padding: "5px 12px",
                                  }}
                              variant="contained"
                          >
                              Delete
                          </Button>
                      </TableCell>
                  </TableRow>
              ))}
              </TableBody>
          </Table>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 0 }}>
          <Header title="All room records" fontSize="20px"/>
          <Table size="small">
              <TableHead>
                  <TableRow>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Room ID</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Building ID</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Description</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Width</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Length</TableCell>
                      <TableCell sx={{"font-weight": "600", "font-size": "15px"}}></TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {roomData.map((row) => (
                  <TableRow key={row.id}>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.room_id}</TableCell>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.building_id}</TableCell>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.description}</TableCell>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.x_length}</TableCell>
                      <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.y_length}</TableCell>
                      <TableCell 
                          sx={{
                              width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                    "& .MuiInputBase-root": {
                                        height: 35
                                    },
                                  }}
                      >
                          <Button
                              startIcon={<DetailsIcon />}
                              sx={{
                                  backgroundColor: "#1976d2",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  padding: "5px 12px",
                                  }}
                              variant="contained"
                              onClick={() => {
                                setConfig(1)
                                setRoomIdForNodeConfig(row.room_id)
                                setRoomSize({x: row.x_length, y: row.y_length})
                              }}
                          >
                              Detail
                          </Button>
                      </TableCell>
                      <TableCell 
                          sx={{
                              width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                    "& .MuiInputBase-root": {
                                        height: 35
                                    },
                                  }}
                      >
                          <Button
                              startIcon={<PermDataSettingIcon />}
                              sx={{
                                  backgroundColor: "#ed6c02",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  padding: "5px 12px",
                                  }}
                              variant="contained"
                          >
                              Setting
                          </Button>
                      </TableCell>
                      <TableCell 
                          sx={{
                              width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                    "& .MuiInputBase-root": {
                                        height: 35
                                    },
                                  }}
                      >
                          <Button
                              startIcon={<DeleteIcon />}
                              sx={{
                                  backgroundColor: "#d32f2f",
                                  fontSize: 10,
                                  fontWeight: "bold",
                                  padding: "5px 12px",
                                  }}
                              variant="contained"
                          >
                              Delete
                          </Button>
                      </TableCell>
                  </TableRow>
              ))}
              </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default RoomList;