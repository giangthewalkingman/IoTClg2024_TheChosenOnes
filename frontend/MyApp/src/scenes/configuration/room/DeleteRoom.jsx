import * as React from 'react';
import { Button, Typography, Backdrop, Stack } from '@mui/material';
import Paper from '@mui/material/Paper';

const DeleteRoom = ({openDelete, selectedRow, handleCancelDelete, handleConfirmDeleteRoom}) => {
	return (
		<Backdrop
			sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
			open={openDelete}
		>
			{selectedRow && (
				<Paper sx={{ padding: '20px', maxWidth: '600px', width: '100%' }}>
					<Typography variant="h3" fontWeight='bold' mb={2} align='center'>
						Confirm delete room
					</Typography>
					<Typography variant='h4'>
						Are you sure that you want to delete this room?
					</Typography>
					<Typography variant='h4'>
						<b>Warning:</b> When you delete this room, all devices in the room will be deleted as well!!!
					</Typography>
					<Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
						<Button variant="contained" color="secondary" onClick={handleCancelDelete}>
							Cancel
						</Button>
						<Button variant="contained" color="primary" onClick={handleConfirmDeleteRoom}>
							Confirm
						</Button>
					</Stack>
				</Paper>
			)}
		</Backdrop>
	)
}

export default DeleteRoom;