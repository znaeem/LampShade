import React from "react";

import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 30,
  borderRadius: 90,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`&.${linearProgressClasses.bar}`]: {
    borderRadius: 90,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

const Progress = (props) => {
  return (
    <div>
      <Chip label={`${props.numerator} / ${props.denominator} completed`} />
      <BorderLinearProgress
        variant="determinate"
        value={(props.numerator / props.denominator) * 100}
      />
    </div>
  );
};

export default Progress;
