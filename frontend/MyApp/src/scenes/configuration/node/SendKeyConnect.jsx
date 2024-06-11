import { useTheme } from "@emotion/react";
import { Box, Button, TextField, Typography, Grid,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useState } from "react"
import InputBox from "../../../components/InputBox";
import { Select, Option } from "../../../components/SelectBox";

const SendKeyConnect = () => {
    const theme = useTheme();
    const [installCode, setInstallCode] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [deviceType, setDeviceType] = useState(0);
    const url = '';

    const send_install_code = (url) => {
        setInstallCode('');
    }
    
    const [missingType, setMissingType] = useState(0);
    const MissingInfo = ({missingType}) => {
        if (missingType === 0) return <></>;
        if (missingType === 1)
        return (
            <Grid item xs={12} pl={1} pt={1} >
                <Typography fontSize='15px' color='red'>
                    Invalid connect key
                </Typography>
            </Grid>
        )
        else return (
            <Grid item xs={12} pl={1} pt={1}>
                <Typography fontSize='15px' color='red'>
                    Please choose device type
                </Typography>
            </Grid>
        )
    }
    return (

        <Grid container p={2} width='100%'>
                <Grid item xs={12} textAlign='center'>
                    <Typography variant="h3" fontWeight='bold'>
                        Connect key
                    </Typography>
                </Grid>
                <Grid item xs={12} pl={1} pb={1}>
                    <Typography fontSize='20px'>
                        Device type:
                    </Typography>
                </Grid>
                <Grid item xs={12} pl={1} pb={1}>
                    <Select defaultValue={0} onChange={(_, newValue) => setDeviceType(newValue)}>
                        <Option value={0}>None</Option>
                        <Option value={1}>Sensor</Option>
                        <Option value={2}>Energy sensor</Option>
                        <Option value={3}>Fan</Option>
                        <Option value={4}>Air conditioner</Option>
                    </Select>
                </Grid>
                <Grid item xs={12} pl={1} pb={1}>
                    <Typography fontSize='20px'>
                        Connect key:
                    </Typography>
                </Grid>
                <Grid item xs={12} pl={1}>
                    <InputBox
                        required
                        id='install_code'
                        name="install_code"
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '') }}
                        placeholder='Input connect key here'
                    />
                </Grid>
                <MissingInfo missingType={missingType}/>
                <Grid item xs={12} pt={1}>
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
                            variant="outlined"
                            onClick={() => {
                                if (document.getElementById('install_code').value === '')
                                    setMissingType(1);
                                else if (deviceType === 0)
                                    setMissingType(2);
                                else {
                                    setMissingType(0);
                                    setInstallCode(document.getElementById('install_code').value)
                                    setOpenDialog(true);
                                }
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
                            maxWidth='xl'
                        >
                            <DialogTitle id="alert-dialog-install-code-title">
                                <Typography variant="h4" fontWeight='bold'>
                                {"Confirm device join permission"}
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                            <DialogContentText id="alert-dialog-install-code-description">
                                <Typography variant='h4' color='black'>
                                Confirm connect key: {installCode}
                                </Typography>
                                <Typography variant='h4' color='black'>
                                Device type: {(() => {
                                        if (deviceType === 1) return 'Sensor'
                                        else if (deviceType === 2) return 'Energy sensor'
                                        else if (deviceType === 3) return 'Fan'
                                        else return 'Air conditioner'
                                    })()}
                                </Typography>
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                            <Button variant="outlined" onClick={() => {
                                setOpenDialog(false)
                            }} color="primary">
                                Cancel
                            </Button>
                            <Button variant="outlined" onClick={() => {
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
    )
}

export default SendKeyConnect;