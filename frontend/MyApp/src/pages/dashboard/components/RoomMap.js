import HeatmapComponent from "./HeatmapComponent/HeatmapComponent";
import { React } from "react";
import { Grid } from "@material-ui/core";
import plan_409 from '../../../images/plan_409.svg';

const RoomMap = () => {
	const sensorData = [
		{ x: 0, y: 50, value: 30, radius: 300 },
		{ x: 50, y: 70, value: 22, radius: 300 },
		{ x: 300, y: 100, value: 44, radius: 300 },
		{ x: 200, y:300, value: 25, radius: 300 },
];
const list_data = [4, 1, 8, 3];
const function_data = ['sensor', 'actuator', 'actuator', 'fan'];

    return (
			<Grid container justifyContent='center'>
				<HeatmapComponent
						nodeData={sensorData}
						nodeList={list_data}
						nodeFunction={function_data}
						pic_src={plan_409}
					/>
			</Grid>
    );
}

export default RoomMap;