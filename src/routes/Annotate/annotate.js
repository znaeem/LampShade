import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { updateData } from "../../features/data/dataSlice";
import { downloadData } from "../../services/data";

import { Button, Box } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FlagIcon from "@mui/icons-material/Flag";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";

import Banner from "../../components/Banner";
import Directions from "../../components/Directions";
import Progress from "../../components/Progress";
import QueryContext from "../../components/QeuryContext";

export const AnnotatePage = () => {
  let dataState = useSelector((state) => state.data.value);
  const dispatch = useDispatch();

  const [progress, setProgress] = useState({
    data: [],
    incomplete: [],
  });

  const [annotation, setAnnotation] = useState({
    index: 0,
    query: "",
    context: "",
    start: null,
    end: null,
    selection: "",
  });

  useEffect(() => {
    let data = [...dataState.dataObject.data];
    let incomplete = [...dataState.dataObject.incomplete];

    let index = Math.min(...incomplete);
    let query = data[index].query;
    let context = data[index].context;
    let start = data[index]["Offsets"][0];
    let end = data[index]["Offsets"][1];
    let selection = end === -1 ? "" : context.slice(start, end);

    setProgress({
      data: data,
      incomplete: incomplete,
    });
    setAnnotation({
      index: index,
      query: query,
      context: context,
      start: start,
      end: end,
      selection: selection,
    });
  }, []);

  // const keyDownHandler = (event) => {
  //   if (event.key === "Enter") {
  //     event.preventDefault();
  //     saveAnnotation();
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("keydown", keyDownHandler);
  //   return () => {
  //     document.removeEventListener("keydown", keyDownHandler);
  //   };
  // }, []);

  const getExample = (index) => {
    let query = progress.data[index].query;
    let context = progress.data[index].context;
    let start = progress.data[index]["Offsets"][0];
    let end = progress.data[index]["Offsets"][1];
    let selection = end === -1 ? "" : context.slice(start, end);
    let obj = {
      index: index,
      query,
      context,
      start,
      end,
      selection,
    };
    return obj;
  };

  const updateProgress = (incomplete, curr_start, curr_end) => {
    let data = [...progress.data];
    let entry = {
      ...data[annotation.index],
      Offsets: [curr_start, curr_end],
    };
    data[annotation.index] = entry;
    console.log(curr_start, curr_end);
    setProgress({
      data: data,
      incomplete: incomplete,
    });
    let obj =
      curr_end === -1
        ? getExample(annotation.index)
        : getExample(annotation.index + 1);
    setAnnotation(obj);

    let dataObject = {
      ...dataState.dataObject,
      data: data,
      incomplete: [...incomplete],
    };
    let payload = {
      ...dataState,
      dataObject: dataObject,
    };
    dispatch(updateData(payload));
    dataState = { ...payload };
  };

  const onSelectedText = (start, end) => {
    setAnnotation({
      ...annotation,
      start: start,
      end: end,
      selection: annotation.context.slice(start, end),
    });
  };

  const saveAnnotation = () => {
    console.log("Saving Annotation");
    let incomplete = new Set([...progress.incomplete]);
    incomplete.delete(annotation.index);
    let start = annotation.start === -1 ? 0 : annotation.start;
    let end = annotation.end === -1 ? 0 : annotation.end;
    updateProgress([...incomplete], start, end);
  };

  const clearAnnotation = () => {
    console.log("Clearing Annotation");
    let incomplete = new Set([...progress.incomplete]);
    incomplete.add(annotation.index);
    let start = -1;
    let end = -1;
    updateProgress([...incomplete], start, end);
  };

  return (
    <div>
      <Banner />
      <br></br>
      <Box
        sx={{
          padding: "10px",
          width: "80%",
          margin: "auto",
        }}
      >
        <Progress
          numerator={progress.data.length - progress.incomplete.length}
          denominator={progress.data.length}
        />
        <Directions text={`Annotation ${annotation.index}`} />
        <QueryContext
          query={annotation.query}
          context={annotation.context}
          answer={annotation.selection}
          onSelectedText={onSelectedText}
        />
        <br></br>
        <Button
          variant="outlined"
          endIcon={<CheckIcon />}
          onClick={() => saveAnnotation()}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          endIcon={<ClearIcon />}
          onClick={() => clearAnnotation()}
        >
          Clear
        </Button>
        <Button
          variant="outlined"
          endIcon={<DownloadIcon />}
          onClick={() => downloadData(dataState)}
        >
          Download
        </Button>
      </Box>
      <Box
        component="span"
        m={1}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ padding: "30px", width: "80%", margin: "auto" }}
      >
        <Button
          disabled={annotation.index === 0}
          variant="contained"
          sx={{ height: 40 }}
          onClick={() => setAnnotation(getExample(annotation.index - 1))}
          startIcon={<ArrowBackIosIcon />}
        >
          Previous
        </Button>
        <Button
          disabled={progress.incomplete.length === 0}
          variant="contained"
          sx={{ height: 40 }}
          onClick={() =>
            setAnnotation(getExample(Math.min(...progress.incomplete)))
          }
          startIcon={<FlagIcon />}
        >
          Unlabelled
        </Button>
        <Button
          disabled={annotation.index === progress.data.length - 1}
          variant="contained"
          sx={{ height: 40 }}
          onClick={() => setAnnotation(getExample(annotation.index + 1))}
          endIcon={<ArrowForwardIosIcon />}
        >
          Next
        </Button>
      </Box>
    </div>
  );
};
