import React, { useState, useEffect } from 'react';
import { Backdrop, Paper, Typography, Grid, TextField, Button } from "@mui/material";

const SettingNode = ({ openSetting, handleClose, nodeData, type }) => {
    const [formData, setFormData] = useState({ ...nodeData });

    useEffect(() => {
        setFormData({ ...nodeData });
    }, [nodeData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Handle save logic here
        handleClose();
    };

    const editableFields = Object.keys(nodeData).filter(key => key !== 'room_id' && key !== 'gateway_id');

    return (
        <Backdrop
            open={openSetting}
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Paper sx={{ padding: '20px', maxWidth: '600px', width: '100%' }}>
                <Typography variant="h4" gutterBottom>
                    Edit {type} Node
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="room_id"
                            name="room_id"
                            label="Room ID"
                            fullWidth
                            variant="standard"
                            value={formData.room_id}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="gateway_id"
                            name="gateway_id"
                            label="Gateway ID"
                            fullWidth
                            variant="standard"
                            value={formData.gateway_id}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                    {editableFields.map((field) => (
                        <Grid item xs={12} sm={6} key={field}>
                            <TextField
                                required
                                id={field}
                                name={field}
                                label={field.replace('_', ' ').toUpperCase()}
                                fullWidth
                                variant="standard"
                                value={formData[field]}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={2} justifyContent="flex-end" mt={2}>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={handleSave}>
                            Save
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Backdrop>
    );
};

export default SettingNode;
