import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { updateData } from "../../features/data/dataSlice";
import { getParsedData, createDataObject } from "../../services/data";
import {
  dataToTable,
  getNullRows,
  alignImputed,
  getKCandidates,
  getKCandidatesTest,
} from "../../services/table";

import Banner from "../../components/Banner";
import FileInput from "../../components/FileUpload";
import Directions from "../../components/Directions";
import Table from "../../components/Table";
import Drawer from "../../components/SlideOver";

export const TablePage = () => {
  const dispatch = useDispatch();
  const uploadDirections =
    "Upload your data. We currently support csv and json formats.";
  const configureDirections =
    "Choose a target column for repair. You can specify exactly which pivot columns to use as context, as well as the number of repair values to compute.";
  const selectDirections =
    "Select the suggested repair value for each relevant row.";

  const [acquiredData, setAcquiredData] = useState({
    selectedFile: null,
    fileName: "No file selected",
    submitted: false,
  });

  const [dataState, updateDataState] = useState({
    fileName: "",
    dataObject: null,
    columns: [],
    data: [],

    numCols: 0,
    numRows: 0,

    kHeaders: [],
    chosenValues: [],
    chosenKHeaders: [],
  });

  const [anchorState, updateAnchorState] = useState({
    imputePhase: false,
    anchor: false,
    prevIndex: 0,
    targetIndex: 0,
    selectedPivots: [],
    numK: 3,
  });

  const onChangeUserDataFile = (event) => {
    let file = event.target.files[0];
    setAcquiredData({
      ...acquiredData,
      selectedFile: file,
      fileName: file.name,
      submitted: true,
    });
  };

  const onSubmit = async () => {
    let content = await getParsedData(acquiredData.selectedFile);
    let dataObject = createDataObject(content);
    let payload = {
      fileName: acquiredData.fileName,
      dataObject: dataObject,
    };
    dispatch(updateData(payload));

    const originialHeaders = Object.keys(dataObject);
    const numCols = originialHeaders.length;
    updateDataState({
      ...dataState,
      dataObject: dataObject,
      ...dataToTable(dataObject),
      fileName: acquiredData.fileName,
      numCols: numCols,
      numRows: dataObject[originialHeaders[0]].length,
    });
    updateAnchorState({
      ...anchorState,
      targetIndex: numCols - 1,
      selectedPivots: [...Array(numCols)].map((x) => false),
    });
  };

  // useEffect(() => {
  //   let dataStateSession = window.localStorage.getItem("dataState");
  //   let anchorStateSession = window.localStorage.getItem("anchorState");

  //   if (dataStateSession !== null && anchorStateSession !== null) {
  //     let dataStateSessionParsed = JSON.parse(dataStateSession);
  //     let anchorStateSessionParsed = JSON.parse(anchorStateSession);
  //     updateDataState({ ...dataStateSessionParsed });
  //     updateAnchorState({ ...anchorStateSessionParsed });
  //   }
  // }, []);

  // useEffect(() => {
  //   window.localStorage.setItem("dataState", JSON.stringify(dataState));
  //   window.localStorage.setItem("anchorState", JSON.stringify(anchorState));
  // }, [dataState, anchorState]);

  useEffect(() => {
    let columns = [...dataState.columns];
    if (columns.length !== 0) {
      delete columns[anchorState.prevIndex]["headerStyle"];
      columns[anchorState.targetIndex]["headerStyle"] = {
        backgroundColor: "#212121",
        color: "#FFF",
      };
      updateDataState({
        ...dataState,
        columns: columns,
      });
      updateAnchorState({
        ...anchorState,
        prevIndex: anchorState.targetIndex,
      });
    }
  }, [anchorState.targetIndex, dataState.kHeaders]);

  useEffect(() => {
    let columns = [...dataState.columns];
    for (let i = 0; i < dataState.kHeaders.length; i++) {
      const header = dataState.kHeaders[i];
      const index = dataState.numCols + i;
      columns[index]["cellStyle"] = (data, rowData) => {
        let id = rowData["MUI_ID"];
        return dataState.chosenKHeaders[id] === header
          ? {
              backgroundColor: "#43a047",
              // color: "#FFF",
              border: "1px solid #eee",
            }
          : { border: "1px solid #eee" };
      };
    }
    updateDataState({
      ...dataState,
      columns: columns,
    });
  }, [dataState.chosenKHeaders]);

  const onCellClick = (event, rowData) => {
    const rowIndex = rowData["MUI_ID"];
    const colIndex = event.target["cellIndex"];
    let header = dataState.columns[colIndex].title;
    let value = event.target.getAttribute("value");
    if (
      value !== "" &&
      dataState.numCols <= colIndex &&
      colIndex < dataState.numCols + anchorState.numK
    ) {
      if (header === dataState.chosenKHeaders[rowIndex]) {
        let targetHeader = dataState.columns[anchorState.targetIndex].title;
        value = dataState.dataObject[targetHeader][rowIndex];
        header = "NONE";
      }
      updateTargetCell(rowIndex, value, header);
    }
  };

  const updateTargetCell = (row, value, header) => {
    // const data = [...dataState.data];
    // const header = dataState.columns[anchorState.targetIndex].title;
    // data[row][header] = value;

    let chosenValues = [...dataState.chosenValues];
    chosenValues[row] = value;
    let chosenKHeaders = [...dataState.chosenKHeaders];
    chosenKHeaders[row] = header;
    updateDataState({
      ...dataState,
      // data: data,
      chosenValues: chosenValues,
      chosenKHeaders: chosenKHeaders,
    });
  };

  const onSelectTarget = (target) => {
    updateAnchorState({ ...anchorState, targetIndex: target });
  };

  const onSelectPivots = (pivots) => {
    updateAnchorState({
      ...anchorState,
      selectedPivots: pivots,
    });
  };

  const onSelectK = (k) => updateAnchorState({ ...anchorState, numK: k });

  const onToggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    )
      return;
    updateAnchorState({ ...anchorState, anchor: open });
  };

  const onCallImpute = async () => {
    let tableData = JSON.parse(JSON.stringify(dataState.dataObject));
    for (let i = 0; i < dataState.numCols; i++) {
      if (!(anchorState.selectedPivots[i] || i === anchorState.targetIndex)) {
        const header = dataState.columns[i].title;
        delete tableData[header];
      }
    }
    const targetName = dataState.columns[anchorState.targetIndex].title;
    const k = anchorState.numK;
    const useFixed = false;
    const givenFixed = null;

    let { ids, dataObjectFiltered } = getNullRows(tableData, targetName);
    // let kDataArr = await getKCandidatesTest();
    let kDataObjectFiltered = await getKCandidates(
      dataObjectFiltered,
      targetName,
      k,
      useFixed,
      givenFixed
    );
    console.log("Received Server Response");

    let { kHeaders, kDataObjectFilled } = alignImputed(
      kDataObjectFiltered,
      ids,
      dataState.numRows
    );
    let newDataObject = { ...dataState.dataObject, ...kDataObjectFilled };

    let chosenValues = [...dataState.dataObject[targetName]];
    let chosenKHeaders = [...Array(dataState.numRows)].map((x) => targetName);
    for (let id of ids) {
      const k1 = kHeaders[0];
      chosenValues[id] = kDataObjectFilled[k1][id];
      chosenKHeaders[id] = k1;
    }
    let { columns, data } = dataToTable(newDataObject);
    for (
      let i = dataState.numCols;
      i < dataState.numCols + anchorState.numK;
      i++
    ) {
      columns[i]["headerStyle"] = { backgroundColor: "#43a047" };
    }

    updateDataState({
      ...dataState,
      columns: [...columns],
      data: [...data],
      kHeaders: kHeaders,
      chosenValues: chosenValues,
      chosenKHeaders: chosenKHeaders,
    });
    updateAnchorState({ ...anchorState, imputePhase: true });
  };

  const onCancelChanges = () => {
    updateDataState({
      ...dataState,
      ...dataToTable(dataState.dataObject),
      kHeaders: [],
      chosenValues: [],
      chosenKHeaders: [],
    });
    updateAnchorState({ ...anchorState, imputePhase: false });
  };

  const onSaveChanges = () => {
    let newDataObject = { ...dataState.dataObject };
    const header = dataState.columns[anchorState.targetIndex].title;
    newDataObject[header] = dataState.chosenValues;
    updateDataState({
      ...dataState,
      dataObject: newDataObject,
      ...dataToTable(newDataObject),
      kHeaders: [],
      chosenValues: [],
      chosenKHeaders: [],
    });
    updateAnchorState({ ...anchorState, imputePhase: false });
  };

  return (
    <div>
      <Banner></Banner>
      <FileInput
        disabled={!acquiredData.submitted}
        fileName={acquiredData.fileName}
        onChange={onChangeUserDataFile}
        onClick={onSubmit}
      ></FileInput>
      {dataState.dataObject !== null ? (
        <>
          <Drawer
            columns={dataState.columns}
            target={anchorState.targetIndex}
            pivots={anchorState.selectedPivots}
            show={anchorState.anchor}
            selectTarget={onSelectTarget}
            selectPivots={onSelectPivots}
            toggleDrawer={onToggleDrawer}
          ></Drawer>
          <Table
            filename={dataState.fileName}
            columns={dataState.columns}
            data={dataState.data}
            numK={anchorState.numK}
            imputePhase={anchorState.imputePhase}
            toggleDrawer={onToggleDrawer}
            selectK={onSelectK}
            callImpute={onCallImpute}
            saveChanges={onSaveChanges}
            cancelChanges={onCancelChanges}
            cellClick={onCellClick}
          ></Table>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
