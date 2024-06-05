import * as React from 'react';
import { useState } from 'react';
import {
  Grid, Typography, TextField, Fab, Stack, Box,
  Tabs, Tab, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, IconButton, Backdrop, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';

export default function NewRoom({ setDataCreateRoom, dataCreateRoom }) {
  const [gateways, setGateways] = useState([]);
  const [showGatewayForm, setShowGatewayForm] = useState(false);
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [roomInfo, setRoomInfo] = useState({ room_id: '', x_length: '', y_length: '', description: '' });

  const handleAddGatewayClick = () => {
    setGateways(prevGateways => [
      ...prevGateways,
      { id: prevGateways.length, name: `Gateway ${prevGateways.length + 1}`, gateway_id: '', mac: '', x: '', y: '' }
    ]);
    setShowGatewayForm(true);
    setValue(gateways.length);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTabChangeIndex = (index) => {
    setValue(index);
  };

  const handleDeleteTab = (index) => {
    setDeleteIndex(index);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    let newGateways = gateways.filter((_, i) => i !== deleteIndex);
    newGateways = newGateways.map((gateway, i) => ({
      ...gateway,
      name: `Gateway ${i + 1}`
    }));
    setGateways(newGateways);
    setValue(newGateways.length > 0 ? (deleteIndex === 0 ? 0 : deleteIndex - 1) : 0);
    setOpenDialog(false);

    // Close the form if there are no more gateways
    if (newGateways.length === 0) {
      setShowGatewayForm(false);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setDeleteIndex(null);
  };

  const handleInputChange = (index, field, value) => {
    const newGateways = [...gateways];
    newGateways[index][field] = value;
    setGateways(newGateways);
  };

  const handleDeleteAllClick = () => {
    setOpenDeleteAllDialog(true);
  };

  const handleConfirmDeleteAll = () => {
    setGateways([]);
    setShowGatewayForm(false);
    setOpenDeleteAllDialog(false);
  };

  const handleCancelDeleteAll = () => {
    setOpenDeleteAllDialog(false);
  };

  const handleSubmit = () => {
    setRoomInfo({
      room_id: document.getElementById('room_id').value,
      x_length: document.getElementById('x_length').value,
      y_length: document.getElementById('y_length').value,
      description: document.getElementById('description').value,
    });
    setOpenBackdrop(true);
  };

  const handleConfirmSubmit = () => {
    setDataCreateRoom({ roomInfo, gateways });
    setOpenBackdrop(false);
  };

  const handleCancelSubmit = () => {
    setOpenBackdrop(false);
  };

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="room_id"
            name="room_id"
            label="Room ID"
            fullWidth
            autoComplete="room_id"
            variant="standard"
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="x_length"
            name="x_length"
            label="Width"
            fullWidth
            autoComplete="x_length"
            variant="standard"
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="y_length"
            name="y_length"
            label="Length"
            fullWidth
            autoComplete="y_length"
            variant="standard"
            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="description"
            name="description"
            label="Description"
            fullWidth
            autoComplete="information"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <Stack justifyContent='space-between' alignItems='center' direction='row'>
            <Typography variant='h4'>Add gateway</Typography>
            <Stack direction="row" spacing={2}>
              <Fab aria-label='add' size='small' onClick={handleAddGatewayClick}>
                <AddIcon />
              </Fab>
              <Fab aria-label='delete' size='small' onClick={handleDeleteAllClick}>
                <DeleteIcon />
              </Fab>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={showGatewayForm}>
            <Box sx={{ bgcolor: 'background.paper', width: '100%', position: 'relative', minHeight: 200, border: '1px solid #ddd', borderRadius: 1, p: 2, mt: 2 }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs"
              >
                {gateways.map((gateway, index) => (
                  <Tab
                    key={gateway.id}
                    label={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {gateway.name}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTab(index);
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </div>
                    }
                  />
                ))}
              </Tabs>
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleTabChangeIndex}
              >
                {gateways.map((gateway, index) => (
                  <TabPanel key={gateway.id} value={value} index={index}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          id={`gateway_id-${index}`}
                          name="gateway_id"
                          label="Gateway ID"
                          fullWidth
                          variant="standard"
                          value={gateway.gateway_id}
                          onChange={(e) => handleInputChange(index, 'gateway_id', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          id={`mac-${index}`}
                          name="mac"
                          label="MAC Address"
                          fullWidth
                          variant="standard"
                          value={gateway.mac}
                          onChange={(e) => handleInputChange(index, 'mac', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          id={`x-${index}`}
                          name="x"
                          label="X Position"
                          fullWidth
                          variant="standard"
                          value={gateway.x}
                          onChange={(e) => handleInputChange(index, 'x', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          id={`y-${index}`}
                          name="y"
                          label="Y Position"
                          fullWidth
                          variant="standard"
                          value={gateway.y}
                          onChange={(e) => handleInputChange(index, 'y', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>
                ))}
              </SwipeableViews>
            </Box>
          </Collapse>
        </Grid>
      </Grid>
      <Dialog
        open={openDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Do you want to delete this tab?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteAllDialog}
        onClose={handleCancelDeleteAll}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Do you want to delete all tabs?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteAll} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteAll} color="primary" autoFocus>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          <Box sx={{ mt: 3 }}>
            <Tabs
              value={value}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs"
            >
              {gateways.map((gateway, index) => (
                <Tab
                  key={gateway.id}
                  label={gateway.name}
                />
              ))}
            </Tabs>
            <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={value}
              onChangeIndex={handleTabChangeIndex}
            >
              {gateways.map((gateway, index) => (
                <TabPanel key={gateway.id} value={value} index={index}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Gateway ID"
                        value={gateway.gateway_id}
                        fullWidth
                        variant="standard"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="MAC Address"
                        value={gateway.mac}
                        fullWidth
                        variant="standard"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="X Position"
                        value={gateway.x}
                        fullWidth
                        variant="standard"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Y Position"
                        value={gateway.y}
                        fullWidth
                        variant="standard"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </TabPanel>
              ))}
            </SwipeableViews>
          </Box>
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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
