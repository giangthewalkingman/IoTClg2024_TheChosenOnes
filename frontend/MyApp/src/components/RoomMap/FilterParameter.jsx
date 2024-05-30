import React from "react";
import { useState, useEffect, memo } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";

const FilterParameter = ({setParaFilter}) => 
{
	const theme = useTheme();
	const [paraState, setParaState] = useState(0)
	const handleChange = (event) => {
		setParaFilter(event.target.value);
		setParaState(event.target.value);
		// setNodeIdFilter(event.target.value);
	};
    const para_filter_dict = [
        {index: 0, value: `Temperature\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 1, value: `Humid\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 2, value: `Wind\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 3, value: `Dust\xa0\xa0\xa0\xa0\xa0\xa0\xa0`},
    ];

  return (
	<FormControl style={{width: '150%'}} size='small'>
		<InputLabel id="demo-simple-select-label">Parameter</InputLabel>
		<Select
			labelId="demo-simple-select-label"
			id="demo-simple-select"
			value={paraState}
			label="Sensor Node"
			onChange={handleChange}
		>
			{
				para_filter_dict.map((i)=>{
					return (
						<MenuItem value={i.index}>{i.value}</MenuItem>
					);		
				})
			}
		</Select>
	</FormControl>
  );
}

export default React.memo(FilterParameter);