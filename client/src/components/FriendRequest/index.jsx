import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as FriendService from "~/services/FriendService";
import { Alerts, Button } from "..";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import useGetMyFriend from "~/hooks/useGetMyFriend";
import useGetRequestSend from "~/hooks/useGetRequestSend";

const FriendRequest = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("success");
  const { friends, reload } = useGetMyFriend();
  const { requestsSend } = useGetRequestSend();

  //close message
  const handleClose = () => {
    setOpen(false);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await FriendService.getFriendRequests();
      if (res) {
        setRequests(res);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  //accept
  const handleAccept = async (id) => {
    try {
      const res = await FriendService.accept({ id });
      if (res) {
        reload();
        fetchRequests();
      }
    } catch (error) {
      setMessage("Something went wrong!");
      setType("error");
      setOpen(true);
    }
  };

  //decline
  const handleDecline = async (id) => {
    try {
      const res = await FriendService.reject({ id });
      if (res?.code === 9999 || res?.status === "REJECTED") {
        fetchRequests();
      }
    } catch (error) {
      setMessage("Something went wrong!");
      setType("error");
      setOpen(true);
    }
  };

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-2xl px-5 py-5 border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
        <span>{t("Lời mời kết bạn")}</span>
        <span>{requests.length}</span>
      </div>

      <Alerts
        message={message}
        type={type}
        open={open}
        handleClose={handleClose}
        position={{ vertical: "bottom", horizontal: "center" }}
        duration={1000}
      />

      <div className="w-full items-center flex flex-col gap-4 pt-4">
        {loading ? (
          <CircularProgress size={30} />
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between">
              <Link
                to={`/profile/${request?.userId}`}
                className="w-full flex gap-4 items-center cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={request?.imageUrl ?? BlankAvatar}
                    alt={request?.userId}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  {request?.status === "ONLINE" ? (
                    <div className="absolute right-0 top-7 w-3 h-3 bg-[#53C259] rounded-full border-2 border-primary" />
                  ) : (
                    <div className="absolute right-0 top-7 w-2 h-2 bg-[#ccc] rounded-full border-2 border-primary" />
                  )}
                </div>

                <div className="flex-1 w-full">
                  <p
                    id="text-ellipsis"
                    className="text-base font-medium text-ascent-1"
                  >
                    {request?.firstName + " " + request?.lastName}
                  </p>
                  <span id="text-ellipsis" className="text-sm text-ascent-2">
                    {request?.username ?? "No username"}
                  </span>
                </div>
              </Link>

              <div className="flex gap-1 w-full h-full items-center justify-end">
                <Button
                  title={t("Chấp nhận")}
                  onClick={() => handleAccept(request.userId)}
                  containerStyles="bg-bluePrimary text-xs border-borderNewFeed border text-white px-1.5 py-1 rounded-xl"
                />
                <Button
                  title={t("Từ chối")}
                  onClick={() => handleDecline(request.userId)}
                  containerStyles="bg-bgColor border border-borderNewFeed text-xs text-ascent-1 px-1.5 py-1 rounded-xl"
                />
              </div>
            </div>
          ))
        ) : (
          <span className="text-ascent-1">{t("Không có lời mời kết bạn")}</span>
        )}
      </div>
    </div>
  );
};

export default FriendRequest;
