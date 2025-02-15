import { MenuItem, Select } from "@mui/material";
import { Radio } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { setLanguage } from "~/redux/Slices/languageSlice";
import i18n from "~/utils/i18n/i18n";

const ChangeLanguage = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);

  const handleChangeLanguage = (e) => {
    const value = e.target.value;
    dispatch(setLanguage(value));
    i18n.changeLanguage(language === "en" ? "vie" : "en");
  };
  const CustomSelect = styled(Select)({
    "& .MuiSelect-select": {
      paddingRight: "0px !important",
    },
  });
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <CustomSelect
        IconComponent={() => {}}
        sx={{
          padding: 0,
          boxShadow: "none",
          ".MuiOutlinedInput-notchedOutline": {
            border: 0,
          },
          "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              border: 0,
            },
          "& .MuiSelect-select": {
            padding: 0,
            "&.css-1pq31d5-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-1pq31d5-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-1pq31d5-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
              {
                padding: 0,
              },
          },
        }}
        value={language}
        onChange={handleChangeLanguage}
      >
        <MenuItem value={"vie"}>
          <span className="text-ascent-1">VIE</span>
        </MenuItem>
        <MenuItem value={"en"}>
          <span className="text-ascent-1">EN</span>
        </MenuItem>
      </CustomSelect>
    </div>
  );
};

export default ChangeLanguage;
