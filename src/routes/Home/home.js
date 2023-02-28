import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { updateData } from "../../features/data/dataSlice";
import { getParsedData, createDataObject } from "../../services/data";

import Banner from "../../components/Banner";
import Directions from "../../components/Directions";
import FileUpload from "../../components/FileUpload";
import NextLink from "../../components/NextLink";

export const HomePage = () => {
  const dispatch = useDispatch();
  const uploadDirections =
    "Upload your data. We currently support csv and json formats. \n The relevant fields should be named 'query' and 'context'.";

  const [acquiredData, setAcquiredData] = useState({
    selectedFile: null,
    fileName: "No file selected",
    uploaded: false,
    submitted: false,
  });

  const onChangeUserDataFile = (event) => {
    let file = event.target.files[0];
    setAcquiredData({
      ...acquiredData,
      selectedFile: file,
      fileName: file.name.replace(/.json/g, ""),
      uploaded: true,
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
    setAcquiredData({
      ...acquiredData,
      submitted: true,
    });
  };

  return (
    <div>
      <Banner />
      <br></br>
      <Directions text={uploadDirections} />
      <FileUpload
        disabled={!acquiredData.uploaded}
        fileName={acquiredData.fileName}
        onChange={onChangeUserDataFile}
        onClick={onSubmit}
      />
      <NextLink
        next={"/annotate"}
        disabled={!acquiredData.submitted}
        text={"Start Labelling"}
      />
    </div>
  );
};
