import React from "react";

const Banner = () => {
  return (
    <div>
      <h1
        style={{
          margin: 0,
          padding: 0,
          fontSize: "6rem",
          fontWeight: "600",
          lineHeight: "1em",
          color: "#2196f3",
          textAlign: "center",
          fontFamily: "lucida grande",
        }}
      >
        Lampshade
      </h1>
      <h3
        style={{
          fontSize: "1.3rem",
          fontWeight: "200",
          marginBottom: "2rem",
          lineHeight: "1em",
          color: "black",
          textAlign: "center",
          fontFamily: "lucida grande",
        }}
      >
        An easy to use tool for Query Answer data labeling
      </h3>
    </div>
  );
};

export default Banner;
