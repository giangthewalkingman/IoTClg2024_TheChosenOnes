import React, { useState, useEffect } from 'react';
import { Button, Typography, Backdrop, Stack } from '@mui/material';
import Paper from '@mui/material/Paper';

const DeleteNode = ({openDelete, nodeData, handleClose, type}) => {
	const [formData, setFormData] = useState({ ...nodeData });
    const Warning = ({type}) => {
        if (type === 'gateways') return (
			<Typography variant='h4'>
				<b>Warning:</b> When you delete gateway, all nodes linking with will be deleted as well!!!
			</Typography>
		)
        if (type === 'sensors') return (
			<Typography variant='h4'>
				<b>Warning:</b> Sensor linking of AC nodes or fan nodes will be affected when you delete this sensor node!!!
			</Typography>
		)
        if (type === 'energy sensors' || type === 'fan nodes' || type === 'AC nodes') return (
			<Typography variant='h4'>
				<b>Warning:</b> This will remove the node from the system!
			</Typography>
		)
    }

	useEffect(() => {
        setFormData({ ...nodeData });
    }, [nodeData]);

	const handleDeleteNode = () => {
		
	}

	return (
		<Backdrop
			sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
			open={openDelete}
		>
			<Paper sx={{ padding: '20px', maxWidth: '600px', width: '100%' }}>
                <Typography variant="h3" fontWeight='bold' mb={2} align='center'>
                    Confirm delete node
                </Typography>
                <Typography variant='h4'>
                    Are you sure that you want to delete this node?
                </Typography>
                <Warning type={type} /> 
                <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                    <Button variant="contained" color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleDeleteNode}>
                        Confirm
                    </Button>
                </Stack>
            </Paper>
		</Backdrop>
	)
}

export default DeleteNode;