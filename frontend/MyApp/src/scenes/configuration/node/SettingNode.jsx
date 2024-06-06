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

    const editableFields = Object.keys(nodeData)

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
                    {editableFields.map((field) => {
                        if (field === 'room_id' || field === 'gateway_id') return (
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
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>
                        )
                        else if (field !== 'num_device' && field !== 'num_sensor_link')
                        return (
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
                        )
                    })}
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
