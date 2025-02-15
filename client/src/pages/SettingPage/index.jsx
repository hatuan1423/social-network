import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alerts,
  BlockList,
  CreatePost,
  DeleteAccount,
  TopBar,
  VerifyEmail,
} from "~/components";
import { RxLockClosed } from "react-icons/rx";
import { RiEyeOffLine } from "react-icons/ri";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import * as UserService from "~/services/UserService";
import { updateStatus } from "~/redux/Slices/userSlice";
import { useTranslation } from "react-i18next";

const SettingPage = () => {
  const theme = useSelector((state) => state.theme.theme);
  const [value, setValue] = useState(0);
  const user = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const { t } = useTranslation("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [icon, setIcon] = useState("");
  const [valueInput, setValueInput] = useState(false);

  const handleChangeValue = (e) => {
    setValueInput(e.target.value);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ height: "screen" }}>{children}</Box>}
      </div>
    );
  };
  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  //change status
  const handleToggle = async () => {
    try {
      const newStatus = user?.status === "ONLINE" ? "OFFLINE" : "ONLINE";
      const res = await UserService.updateStatus({ status: newStatus, token });
      if (res?.code === 1000) {
        dispatch(updateStatus(res?.result?.status));
      } else {
        setMessage("Something went wrong!");
        setType("error");
        setOpen(true);
      }
    } catch (error) {
      setMessage("Something went wrong!");
      setType("error");
      setOpen(true);
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar title={"Settings"} iconBack />
      <CreatePost />
      <Alerts
        message={message}
        type={type}
        icon={icon}
        open={open}
        handleClose={handleClose}
        position={{ vertical: "bottom", horizontal: "center" }}
        duration={3000}
      />

      <div className="w-full h-full flex justify-center">
        <div className="w-[680px] flex flex-col h-full bg-primary p-5 rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tabs
                sx={{
                  color: theme === "dark" ? "#fff" : "#000",
                  "& .MuiTabs-indicator": {
                    backgroundColor: theme === "dark" ? "#fff" : "#000",
                    height: "1px",
                  },
                }}
                indicatorColor="primary"
                textColor="inherit"
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                aria-label="basic tabs example"
              >
                <Tab label={t("Quyền riêng tư")} {...a11yProps(0)} />
                <Tab label={t("Tài khoản")} {...a11yProps(1)} />
                <Tab label={t("Trợ giúp")} {...a11yProps(2)} />
              </Tabs>
            </Box>
            {/* 1 */}
            <CustomTabPanel value={value} index={0}>
              <div className="w-full h-ful gap-y-3 py-5 flex-col flex justify-center items-center">
                {/* 1 */}
                <div className="w-full py-3 px-2 h-full flex justify-between items-center">
                  <div className="flex items-center gap-x-2">
                    <RxLockClosed size={20} className="text-bgStandard" />
                    <h1 className="text-ascent-1">
                      {t("Trang cá nhân riêng tư")}
                    </h1>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 hover:bg-gray-300 peer-focus:outline-0 peer-focus:ring-transparent rounded-full peer transition-all ease-in-out duration-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bluePrimary hover:peer-checked:bg-bluePrimary"></div>
                    </label>
                  </div>
                </div>

                {/* 2 */}
                <div className="w-full py-3 px-2 h-full flex justify-between items-center">
                  <div className="flex items-center gap-x-2">
                    <RiEyeOffLine size={20} className="text-bgStandard" />
                    <h1 className="text-ascent-1">
                      {t("Trạng thái hoạt động")}
                    </h1>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user?.status === "ONLINE" ? true : false}
                        onChange={handleToggle}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 hover:bg-gray-300 peer-focus:outline-0 peer-focus:ring-transparent rounded-full peer transition-all ease-in-out duration-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bluePrimary hover:peer-checked:bg-bluePrimary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CustomTabPanel>
            {/* 2 */}
            <CustomTabPanel value={value} index={1}>
              <div className="w-full h-ful gap-y-3 py-5 flex-col flex justify-center items-center">
                {/* 1 */}
                <div className="w-full py-3  px-2 h-full flex justify-between items-center cursor-pointer">
                  <h1 className="text-ascent-1">
                    {t("Vô hiệu hóa hoặc xóa tài khoản")}
                  </h1>
                  <DeleteAccount setting />
                </div>

                {/* 2 */}
                <div className="w-full py-3  px-2 h-full flex justify-between items-center cursor-pointer">
                  <h1 className="text-ascent-1">
                    {t("Xác thực email của bạn")}
                  </h1>
                  <VerifyEmail setting />
                </div>

                {/* 3 */}
                <div className="w-full py-3 px-2 h-full flex justify-between items-center cursor-pointer">
                  <h1 className="text-ascent-1">{t("Đã chặn")}</h1>
                  <BlockList setting />
                </div>
              </div>
            </CustomTabPanel>
            {/* 3 */}
            <CustomTabPanel value={value} index={2}>
              <div className="w-full h-ful gap-y-5 py-5 flex-col flex justify-center items-center">
                {/* 1 */}
                <a
                  href="https://vietnam.un.org/vi"
                  target="_blank"
                  className="w-full py-3 px-2 h-full flex justify-between items-center"
                >
                  <h1 className="text-ascent-1">{t("Trung tâm trợ giúp")}</h1>
                  <FaArrowUpRightFromSquare
                    size={20}
                    className="text-bgStandard"
                  />
                </a>

                {/* 2 */}
                <a
                  href="https://vietnam.un.org/vi"
                  target="_blank"
                  className="w-full py-3 px-2 h-full flex justify-between items-center"
                >
                  <h1 className="text-ascent-1">
                    {t("Chính sách và quyền riêng tư của LinkVerse")}
                  </h1>
                  <FaArrowUpRightFromSquare
                    size={20}
                    className="text-bgStandard"
                  />
                </a>
                {/* 3 */}
                <a
                  href="https://vietnam.un.org/vi"
                  target="_blank"
                  className="w-full py-3 px-2 h-full flex justify-between items-center"
                >
                  <h1 className="text-ascent-1">
                    {t("Điều khoản dịch vụ của LinkVerse")}
                  </h1>
                  <FaArrowUpRightFromSquare
                    size={20}
                    className="text-bgStandard"
                  />
                </a>
                {/* 4 */}
                <a
                  href="https://vietnam.un.org/vi"
                  target="_blank"
                  className="w-full py-3 px-2 h-full flex justify-between items-center"
                >
                  <h1 className="text-ascent-1">{t("Chính sách cookies")}</h1>
                  <FaArrowUpRightFromSquare
                    size={20}
                    className="text-bgStandard"
                  />
                </a>
              </div>
            </CustomTabPanel>
          </Box>
        </div>
      </div>
      <CreatePost buttonRight />
    </div>
  );
};

export default SettingPage;
