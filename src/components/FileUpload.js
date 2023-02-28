import React from "react";
import { Box, Stack, Button, TextField } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FileUpload = (props) => {
  return (
    <div>
      <Box m={3} display="flex" justifyContent="center" alignItems="center">
        <Stack direction="row">
          <Button
            startIcon={<UploadFileIcon />}
            variant="contained"
            component="label"
          >
            Browse
            <input
              hidden
              type="file"
              accept=".csv, .json"
              onChange={props.onChange}
            />
          </Button>
          <TextField
            value={props.fileName}
            InputProps={{
              readOnly: true,
            }}
          />
          <Button
            onClick={props.onClick}
            disabled={props.disabled}
            variant="contained"
            component="label"
          >
            Sumbit
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

export default FileUpload;
