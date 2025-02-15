import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { Fade, Grow } from "@mui/material";
import styled from "@emotion/styled";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow di rection="up" ref={ref} timeout={1000} {...props} />;
});

const StyledDialog = styled(Dialog)(({ theme, width }) => ({
  "& .MuiPaper-root": {
    backgroundColor: theme.colorSchemes.light.primary.main,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.colorSchemes.dark.primary.main,
    }),
    borderRadius: "20px",
    width: width || "500px",
    maxWidth: "90%",
    margin: "0 auto",
  },
}));

const DialogCustom = ({
  isOpen,
  children,
  classNames,
  theme,
  imageSrc,
  handleCloseDiaLogAdd,
  width,
}) => {
  return (
    <StyledDialog
      TransitionComponent={Transition}
      onClose={handleCloseDiaLogAdd}
      open={isOpen}
      fullWidth
      width={width}
    >
      {imageSrc && <img src={imageSrc} />}
      {children}
    </StyledDialog>
  );
};

export default DialogCustom;
