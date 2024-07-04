import React, { useState, useEffect } from 'react';
import { Backdrop, Paper, Typography, Grid, TextField, Button } from "@mui/material";
import InputBox from '../../../components/InputBox';
import { host } from '../../../App';

const SettingNode = ({ openSetting, handleClose, nodeData, type }) => {
    const [formData, setFormData] = useState({ ...nodeData });
    const titleBackDrop = (type) => {
        if (type === 'gateways') return 'gateway'
        if (type === 'sensors') return 'sensor node'
        if (type === 'energy sensors') return 'energy sensor node'
        if (type === 'fan nodes') return 'fan node'
        if (type === 'AC nodes') return 'AC node'
    }

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

    const handleSettingsNode = (e) => {
        // Handle save logic here
				const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
				let url = ''
				if (type === 'gateways') url = `http://${host}/registration_gateway/update`
        else if (type === 'sensors') url = `http://${host}/registration_sensor/update/${formData.sensor_id}`
        else if (type === 'energy sensors') url = `http://${host}/registration_em/update/${formData.em_id}`
        else if (type === 'fan nodes') url = `http://${host}/registration_fan/update/${formData.fan_id}`
        else if (type === 'AC nodes') url = `http://${host}/registration_ac/update/${formData.ac_id}`
				update_node_data(formData, url)
        handleClose();
    };

		const update_node_data = async (data, url) => {
      try {
          const update_data_response = await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
    
          if (update_data_response.status == 200) {
            const update_data_json = await update_data_response.json();
            alert('Success update node infomation!');
          } else {
            alert('Update node failed!');
          }
        } catch (error) {
          console.error('Error:', error);
        }
		}

    const editableFields = Object.keys(nodeData)

    return (
        <Backdrop
            open={openSetting}
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Paper sx={{ padding: '20px', maxWidth: '700px', width: '100%' }}>
                <Typography variant="h3" align='center' fontWeight='bold' mb={1}>
                    Edit {titleBackDrop(type)}
                </Typography>
                <Grid container spacing={3}>
                    {editableFields.map((field) => {
                        if (field === 'room_id' || field === 'gateway_id') return (
                            <Grid item xs={12} md={6} key={field}>
                                <Typography variant='h4' mb={1}>
                                    {field.replace('_', ' ').toUpperCase()}
                                </Typography>
                                <InputBox 
                                    required
                                    id={field}
                                    name={field}
                                    placeholder={field.replace('_', ' ').toUpperCase()}
                                    value={formData[field]}
                                    readOnly={true}
                                />
                            </Grid>
                        )
                        else if (field === 'sensor_link' || field === 'x_pos_device' || field === 'y_pos_device')
                            return (
                                <Grid item xs={12} md={6} key={field}>
                                    <Typography variant='h4' mb={1}>
                                        {field.replace('_', ' ').toUpperCase()}
                                    </Typography>
                                    <InputBox 
                                        required
                                        id={field}
                                        name={field}
                                        placeholder={field.replace('_', ' ').toUpperCase()}
                                        value={formData[field]}
                                        onChange={handleInputChange}
                                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9 ,]/g, '') }}
                                    />
                                </Grid>
                            )
                        else if (field !== 'num_device' && field !== 'num_sensor_link')
                        return (
                            <Grid item xs={12} md={6} key={field}>
                                <Typography variant='h4' mb={1}>
                                    {field.replace('_', ' ').toUpperCase()}
                                </Typography>
                                <InputBox 
                                    required
                                    id={field}
                                    name={field}
                                    placeholder={field.replace('_', ' ').toUpperCase()}
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
                                />
                            </Grid>
                        )
                    })}
                </Grid>
                <Grid container spacing={2} justifyContent="flex-end" mt={2}>
                    <Grid item>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={handleSettingsNode}>
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Backdrop>
    );
};

export default SettingNode;
