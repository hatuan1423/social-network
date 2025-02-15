import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import CreateGroup from "../CreateGroup";
import * as GroupService from "~/services/GroupService";
import { GroupCard } from "..";
import { useTranslation } from "react-i18next";
import useGetGroups from "~/hooks/useGetGroups";

const Group = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [loading, setLoading] = useState(false);
  // const [groups, setGroups] = useState([]);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const size = 10;
  const { groups } = useGetGroups();
  // const fetchGroups = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await GroupService.getAllGroup({ page, size, token });
  //     if (res.code === 200 && res?.result?.content?.length) {
  //       setGroups(res?.result?.content);
  //     }
  //   } catch (error) {
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchGroups();
  // }, []);

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-2xl px-5 py-5 border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <CreateGroup open={open} handleClose={handleClose} />
      <div className="flex items-center justify-between text-xl text-ascent-1 pb-4 border-b border-[#66666645]">
        <span className="text-lg font-medium">{t("Nhóm")}</span>
      </div>

      <div className="w-full items-center max-h-[360px] flex flex-col gap-4 pt-4 overflow-hidden">
        <div className="flex gap-4 w-full items-center cursor-pointer">
          <div
            onClick={() => setOpen(true)}
            className="w-12 h-12 rounded-full border-1 border-borderNewFeed opacity-100 hover:opacity-80 hover:scale-105 transition-transform shadow-2xl flex items-center justify-center"
          >
            <GoPlus size={30} color="#005DFF" />
          </div>
          <div className="flex-1">
            <p className="text-base font-medium text-ascent-1">
              {t("Tạo nhóm của bạn")}
            </p>
            <span className="text-sm text-ascent-2">
              {t("Tạo nhóm để chia sẻ với mọi người")}
            </span>
          </div>
        </div>
        {groups.length > 0 &&
          groups.map((group) => <GroupCard key={group.id} group={group} />)}
      </div>
    </div>
  );
};

export default Group;
