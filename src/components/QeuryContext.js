import React from "react";
import { Grid, Paper } from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme, type }) => ({
  ...theme.typography.body2,
  paddingTop: "15px",
  textAlign: "center",
  color: theme.palette.text.secondary,
  lineHeight: "25px",
  fontFamily: type === "label" ? "lucida grande" : "Courier New",
}));

// const darkTheme = createTheme({ palette: { mode: "dark" } });
const lightTheme = createTheme({ palette: { mode: "light" } });

const QueryContext = (props) => {
  const onSelectedText = (start, end, text) => {
    if (start === end) {
      start = 0;
      end = 0;
    } else if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    while (text[start] === " ") {
      start++;
    }
    while (text[end - 1] === " ") {
      end--;
    }
    props.onSelectedText(start, end);
  };

  return (
    <div>
      <Grid container columnSpacing={2} rowSpacing={3}>
        <Grid item xs={1.2}>
          <ThemeProvider theme={lightTheme}>
            <Item type={"label"} elevation={0}>
              {"Query: "}
            </Item>
          </ThemeProvider>
        </Grid>
        <Grid item xs={10.8}>
          <ThemeProvider theme={lightTheme}>
            <Item sx={{ height: 60, textAlign: "left" }} elevation={3}>
              {props.query}
            </Item>
          </ThemeProvider>
        </Grid>
        <Grid item xs={1.2}>
          <ThemeProvider theme={lightTheme}>
            <Item type={"label"} elevation={0}>
              {"Context: "}
            </Item>
          </ThemeProvider>
        </Grid>
        <Grid item xs={10.8}>
          <ThemeProvider theme={lightTheme}>
            <Item
              sx={{ height: 128, textAlign: "left" }}
              elevation={3}
              onClick={() => {
                var selection = document.getSelection();
                if (selection.anchorNode != null) {
                  onSelectedText(
                    selection.anchorOffset,
                    selection.focusOffset,
                    selection.anchorNode.textContent
                  );
                }
              }}
            >
              {props.context}
            </Item>
          </ThemeProvider>
        </Grid>
        <Grid item xs={1.2} type={"label"}>
          <ThemeProvider theme={lightTheme}>
            <Item type={"label"} elevation={0}>
              {"Answer: "}
            </Item>
          </ThemeProvider>
        </Grid>
        <Grid item xs={10.8}>
          <ThemeProvider theme={lightTheme}>
            <Item sx={{ height: 60 }} elevation={3}>
              {props.answer}
            </Item>
          </ThemeProvider>
        </Grid>
      </Grid>
    </div>
  );
};

export default QueryContext;
