import React, { useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import { CustomizeMenu } from "..";
import { Divider, MenuItem } from "@mui/material";
import { FaCheck } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import styled from "@emotion/styled";
import { setSentiment } from "~/redux/Slices/postSlice";
import { selectsPost } from "~/constants";
import { useTranslation } from "react-i18next";

const SelectPosts = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const sentiment = useSelector((state) => state.post.sentiment);
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const StyledDivider = styled(Divider)(({ theme }) => ({
    width: "220px",
    borderColor: theme.colorSchemes.light.border,
    margin: `${theme.spacing(0.5)} 0`,

    ...theme.applyStyles("dark", {
      borderColor: theme.colorSchemes.dark.border,
    }),
  }));

  const handleMenuItemClick = (e, i) => {
    dispatch(setSentiment(selectsPost[i]));
    setAnchorEl(null);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:scale-110 active:scal90 cursor-pointer transition-transform border-1 border-borderNewFeed shadow-newFeed"
      >
        <RiArrowDownSLine size={14} className="text-bgStandard" />
      </div>
      <CustomizeMenu
        anchor={{ vertical: "top", horizontal: "center" }}
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        styles={{ marginTop: "8px" }}
      >
        {selectsPost.map((option, i) => (
          <div key={i}>
            <MenuItem
              onClick={(e) => handleMenuItemClick(e, i)}
              selected={selectsPost[i] === sentiment}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-ascent-1">{t(option)}</span>
                {selectsPost[i] === sentiment && <FaCheck color="black" />}
              </div>
            </MenuItem>
            {i === 0 && <StyledDivider />}
          </div>
        ))}
      </CustomizeMenu>
    </div>
  );
};

export default SelectPosts;
