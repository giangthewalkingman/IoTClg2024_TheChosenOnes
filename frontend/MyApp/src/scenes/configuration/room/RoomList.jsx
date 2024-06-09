import * as React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Header from '../../../components/Header';
import { Button, Grid, Typography, Backdrop, Stack } from '@mui/material';
import InputBox from '../../../components/InputBox';
import Paper from '@mui/material/Paper';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DetailsIcon from '@mui/icons-material/Details';

const RoomList = ({ setConfig, setRoomIdForNodeConfig, setRoomSize }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const room_data_url = `http://${host}/room/getall`;
  const building_data_url = `http://${host}/building/getall`;
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [missingType, setMissingType] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const widthRef = useRef(null);
  const lengthRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleSettingRoom = (row) => {
    setOpenBackdrop(true);
    setSelectedRow(row);
    setRoomIdForNodeConfig(row.room_id);
    setRoomSize({ x: row.x_length, y: row.y_length });
  };

  const handleCancelSettings = () => {
    setOpenBackdrop(false);
    setMissingType(0);
    setSelectedRow(null);
  };

  const handleConfirmSettingRoom = () => {
    const { building_id, room_id } = selectedRow;
    const x_length = widthRef.current.value;
    const y_length = lengthRef.current.value;
    const description = descriptionRef.current.value;

    if (x_length === '' || y_length === '' || description === '') {
      setMissingType(1);
    } else {
      setMissingType(0);
      setOpenBackdrop(false);
      update_room_data(building_id, room_id, x_length, y_length, description);
    }
  };

  const update_room_data = (building_id, room_id, x_length, y_length, description) => {
    // Update room data logic here
  };

  const get_information_data = async (room_data_url, building_data_url) => {
    try {
      const room_data_response = await fetch(room_data_url);
      const building_data_response = await fetch(building_data_url);
      if (room_data_response.status === 200 && building_data_response.status === 200) {
        const room_data_json = await room_data_response.json();
        const building_data_json = await building_data_response.json();
        if (room_data_json && building_data_json) {
          setRoomData(room_data_json);
          setBuildingData(building_data_json);
          setIsLoading(false);
        } else {
          alert('No info data!');
        }
      } else {
        alert(`Cannot call to server! Error code: ${room_data_response.status !== 200 ? room_data_response.status : building_data_response.status}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data from server.');
    }
  };

  useEffect(() => {
    if (isLoading) {
      get_information_data(room_data_url, building_data_url);
    } else {
      const timer = setTimeout(() => {
        get_information_data(room_data_url, building_data_url);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    isLoading ? <h1>Loading...</h1> :
    <Grid container display='flex' rowSpacing={2} m={0}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 0 }}>
          <Header title="All building records" fontSize="20px" />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Building ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}></TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}></TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buildingData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.building_id}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.name}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.location}</TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <Button
                      startIcon={<DetailsIcon />}
                      sx={{
                        backgroundColor: "#1976d2",
                        fontSize: 10,
                        fontWeight: "bold",
                        padding: "5px 12px",
                      }}
                      variant="contained"
                    >
                      Detail
                    </Button>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <Button
                      startIcon={<PermDataSettingIcon />}
                      sx={{
                        backgroundColor: "#ed6c02",
                        fontSize: 10,
                        fontWeight: "bold",
                        padding: "5px 12px",
                      }}
                      variant="contained"
                    >
                      Setting
                    </Button>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
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
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 0 }}>
          <Header title="All room records" fontSize="20px" />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Room ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Building ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Width</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Length</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}></TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}></TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.room_id}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.building_id}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.description}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.x_length}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: 13 }}>{row.y_length}</TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <Button
                      startIcon={<DetailsIcon />}
                      sx={{
                        backgroundColor: "#1976d2",
                        fontSize: 10,
                        fontWeight: "bold",
                        padding: "5px 12px",
                      }}
                      variant="contained"
                      onClick={() => {
                        setConfig(1);
                        setRoomIdForNodeConfig(row.room_id);
                        setRoomSize({ x: row.x_length, y: row.y_length });
                      }}
                    >
                      Detail
                    </Button>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <Button
                      startIcon={<PermDataSettingIcon />}
                      sx={{
                        backgroundColor: "#ed6c02",
                        fontSize: 10,
                        fontWeight: "bold",
                        padding: "5px 12px",
                      }}
                      variant="contained"
                      onClick={() => handleSettingRoom(row)}
                    >
                      Setting
                    </Button>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
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
    </Grid>
  );
};

export default RoomList;
