import { useTheme } from "@emotion/react";
import { Box, Button, TextField, Typography, Grid,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useState } from "react"

const SendKeyConnect = () => {
    const theme = useTheme();
    const [installCode, setInstallCode] = useState('');
    const [openDialog, setOpenDialog] = useState(false)
    const url = '';
    const send_install_code = (url) => {
        setInstallCode('');
    }
    return (

        <Box 
            sx={{boxShadow: 0,
                borderRadius: '5px', 
                backgroundColor: theme.palette.background.paper}}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justify="center"
        >
            <Grid container spacing={1} p={2}>
                <Grid item xs={12}>
                    <Typography variant="h4" fontWeight='bold'>
                        Connect key
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id='install_code'
                        name="install_code"
                        label="Connect key"
                        fullWidth
                        variant="standard"
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '') }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
                        <Button
                            sx={{
                                "min-width": "30px",
                                fontSize: "16px",
                                fontWeight: "bold",
                            }}
                            style={{
                                borderColor: theme.palette.text.primary,
                                color: theme.palette.text.primary,
                            }}
                            size="small"
                            onClick={() => {
                                setInstallCode(document.getElementById('install_code').value)
                                setOpenDialog(true);
                            }}
                        >
                            Send
                        </Button>
                        <Dialog
                            open={openDialog}
                            onClose={() => {
                                setOpenDialog(false)
                            }}
                            aria-labelledby="alert-dialog-install-code-title"
                            aria-describedby="alert-dialog-install-code-description"
                        >
                            <DialogTitle id="alert-dialog-install-code-title">{"Do you want to delete all tabs?"}</DialogTitle>
                            <DialogContent>
                            <DialogContentText id="alert-dialog-install-code-description">
                                Confirm connect key: {installCode}
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={() => {
                                setOpenDialog(false)
                            }} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                setOpenDialog(false);
                                send_install_code(url);
                            }} color="primary" autoFocus>
                                Confirm
                            </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default SendKeyConnect;