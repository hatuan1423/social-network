import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { Alerts, CustomizeMenu, DialogCustom } from "..";
import { BiCommentDetail } from "react-icons/bi";
import { CircularProgress, Divider, MenuItem, styled } from "@mui/material";
import { TbMessageReport } from "react-icons/tb";
import { RiAttachment2 } from "react-icons/ri";
import { ImUserMinus } from "react-icons/im";
import { useSelector } from "react-redux";
import { getBase64 } from "~/utils";
import { BiSolidLockAlt, BiDislike, BiSolidDislike } from "react-icons/bi";
import CreateComment from "../CreateComment";
import * as PostService from "~/services/PostService";
import * as UserService from "~/services/UserService";
import AlertWelcome from "../AlertWelcome";
import { BlankAvatar } from "~/assets";
import { FaEarthAmericas, FaRegTrashCan } from "react-icons/fa6";
import { FiBookmark } from "react-icons/fi";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import ChangeVisibility from "../ChangeVisibility";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { useTranslation } from "react-i18next";
import { MdOutlineGTranslate } from "react-icons/md";
import { Skeleton } from "antd";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";

const PostCard = ({ post, isShowImage, onSuccess, fetchPosts }) => {
  const theme = useSelector((state) => state.theme.theme);
  const { t } = useTranslation();
  const userState = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(0);
  const [likeCount, setLikeCount] = useState(post?.like || 0);
  const [dislikeCount, setDislikeCount] = useState(post?.unlike || 0);
  const [like, setLike] = useState(false);
  const [disLike, setDisLike] = useState(false);
  const [typeMessage, setTypeMessage] = useState("success");
  const [message, setMessage] = useState("");
  const [openMessage, setOpenMessage] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [type, setType] = useState("");
  const [icon, setIcon] = useState(null);
  const [duration, setDuration] = useState("");
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [translateLoading, setTranslateLoading] = useState(false);
  const [changeVisibility, setChangeVisibility] = useState(false);
  const handleCloseChangeVisibility = () => setChangeVisibility(false);
  const handleCloseAlert = () => setOpenAlert(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const imgRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [openImagePreview, setOpenImagePreview] = useState(false);
  const handleClosePreview = () => setOpenImagePreview(false);
  const [isOpenReply, setIsOpenReply] = useState(false);
  const [file, setFile] = useState(null);
  const [img, setImg] = useState("");
  const handleCloseReply = () => setIsOpenReply(false);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleCloseMessage = () => setOpenMessage(false);
  const { user } = useGetDetailUserById({ id: post?.userId });

  const StyledDivider = styled(Divider)(({ theme }) => ({
    borderColor: theme.colorSchemes.light.border,
    margin: `${theme.spacing(0.5)} 0`,
    ...theme.applyStyles("dark", {
      borderColor: theme.colorSchemes.dark.border,
    }),
  }));

  const renderContentWithHashtags = (content) => {
    if (!content) return "";
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (/^#[A-Za-z0-9_]+$/.test(part)) {
        return (
          <span key={index} className="text-blue cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  //preview img
  const handleClickImage = () => {
    setImagePreview(imgRef.current.src);
    setOpenImagePreview(true);
  };

  //comment
  const handleComment = (id) => {
    if (!token) {
      setType("like");
      setOpenAlert(true);
      return;
    }
    setIsOpenReply(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  useEffect(() => {
    if (file) {
      getBase64(file)
        .then((result) => setImg(result))
        .catch((error) => console.error(error));
    }
  }, [file]);

  const handleDeleteImg = () => {
    setFile(null);
    setImg("");
  };

  //like
  const handleLike = async (id) => {
    if (!token) {
      setType("like");
      setOpenAlert(true);
      return;
    }

    try {
      const res = await PostService.like({ id, token });
      if (res?.code === 200) {
        setMessage("You liked the post!");
        setTypeMessage("success");
        setLike(true);
        setLikeCount((prev) => prev + 1);
        setOpenMessage(true);
      }
      if (res?.code === 400) {
        setTypeMessage("error");
        setMessage("You have already liked this post.");
        setOpenMessage(true);
      }
    } catch (error) {
      if (error.response?.data?.code === 400) {
        setTypeMessage("error");
        setMessage("You have already liked this post.");
        setOpenMessage(true);
      } else {
        setMessage("An error occurred. Please try again.");
        setOpenMessage(true);
      }
    }
  };

  //dislike
  const handleDisLike = async (id) => {
    if (!token) {
      setType("like");
      setOpenAlert(true);
      return;
    }

    try {
      const res = await PostService.dislike({ id, token });
      if (res?.code === 200) {
        setMessage("You disliked the post!");
        setTypeMessage("success");
        setDisLike(true);
        setDislikeCount((prev) => prev + 1);
        setOpenMessage(true);
      }
      if (res?.code === 400) {
        setTypeMessage("error");
        setMessage("You have already disliked this post.");
        setOpenMessage(true);
      }
    } catch (error) {
      if (error.response?.data?.code === 400) {
        setTypeMessage("error");
        setMessage("You have already liked this post.");
        setOpenMessage(true);
      } else {
        setMessage("An error occurred. Please try again.");
        setOpenMessage(true);
      }
    }
  };

  //save url
  const handleSaveUrl = (id) => {
    copyToClipboard(`http://localhost:5173/post/${id}`);
  };

  //share post
  const handleShare = async (id) => {
    if (!token) {
      setType("share");
      setOpenAlert(true);
      return;
    }
    try {
      setIcon(<CircularProgress size={20} color="white" />);
      setMessage("Share post...");
      setTypeMessage("warning");
      setOpenMessage(true);
      const res = await PostService.share({ id, token });
      if (res?.code === 200) {
        setDuration(3000);
        setIcon();
        setMessage("Share post success!");
        setTypeMessage("success");
        setOpenMessage(true);
      }
    } catch (error) {
      setDuration(3000);
      setIcon();
      setMessage("Something went wrong!");
      setTypeMessage("error");
      setOpenMessage(true);
    }
  };

  //delete post
  const handleDeletePost = async (id) => {
    try {
      handleClose();
      setIcon(<CircularProgress size={20} color="white" />);
      setMessage("Delete post...");
      setTypeMessage("warning");
      setOpenMessage(true);
      const res = await PostService.deletePost({ id, token });
      if (res?.code === 200) {
        onSuccess();
        setDuration(3000);
        setIcon();
        setMessage(res?.message);
        setTypeMessage("success");
        setOpenMessage(true);
      }
    } catch (error) {
      setDuration(3000);
      setIcon();
      setMessage("Something went wrong!");
      setTypeMessage("error");
      setOpenMessage(true);
    }
  };

  //save post
  const handleSavePost = async (id) => {
    try {
      handleClose();
      setIcon(<CircularProgress size={20} color="white" />);
      setMessage("Save post...");
      setTypeMessage("warning");
      setOpenMessage(true);
      const res = await PostService.save({ id, token });
      if (res?.code === 400) {
        setDuration(3000);
        setIcon();
        setMessage("Post already saved!");
        setTypeMessage("error");
        setOpenMessage(true);
        return;
      }
      setDuration(3000);
      setIcon();
      setMessage("Save post success!");
      setTypeMessage("success");
      setOpenMessage(true);
    } catch (error) {
      setDuration(3000);
      setIcon();
      setMessage("Something went wrong!");
      setTypeMessage("error");
      setOpenMessage(true);
    }
  };

  //block user
  const handleBlockUser = async (id) => {
    try {
      handleClose();
      setIcon(<CircularProgress size={20} color="white" />);
      setMessage("Block user...");
      setTypeMessage("warning");
      setOpenMessage(true);
      const res = await UserService.block(id);
      if (res) {
        onSuccess();
        setDuration(3000);
        setIcon();
        setMessage("Block user success!");
        setTypeMessage("success");
        setOpenMessage(true);
      }
    } catch (error) {
      onSuccess();
      setDuration(3000);
      setIcon();
      setMessage("Something went wrong!");
      setTypeMessage("error");
      setOpenMessage(true);
    }
  };

  //translate
  const handleTranslate = async ({ id, language }) => {
    setTranslateLoading(true);
    try {
      handleClose();
      const res = await PostService.translatePost({
        id,
        language: language === "vi" ? "en" : "vi",
        token,
      });
      if (res?.code === 200) {
        post.language = res?.result?.language;
        post.content = res?.result?.content;
      }
    } catch (error) {
      throw error;
    } finally {
      setTranslateLoading(false);
    }
  };

  //change visibility
  const onSuccessChange = () => {
    handleClose();
    onSuccess();
  };

  return (
    <div className="bg-primary p-2 rounded-xl">
      <AlertWelcome
        open={openAlert}
        handleClose={handleCloseAlert}
        type={type}
      />
      <ChangeVisibility
        openChange={changeVisibility}
        handleClose={handleCloseChangeVisibility}
        closeMenu={handleClose}
        post={post}
        onSuccessChange={onSuccess}
      />
      <Alerts
        type={typeMessage}
        icon={icon}
        duration={duration}
        message={message}
        open={openMessage}
        position={{ vertical: "bottom", horizontal: "center" }}
        handleClose={handleCloseMessage}
      />
      <div
        onClick={() => navigate(`/post/${post.id}`)}
        className="flex gap-3 items-center mb-2 cursor-pointer"
      >
        <img
          onClick={(e) => e.stopPropagation()}
          src={user?.imageUrl ?? BlankAvatar}
          alt="avatar"
          className="w-14 h-14 object-cover border-1 border-borderNewFeed shadow-newFeed bg-no-repeat rounded-full shrink-0"
        />

        <div className="w-full flex justify-between">
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 ">
              <Link to={`/profile/${post?.userId}`}>
                <p className="font-medium text-lg text-ascent-1">
                  {user?.username || "No name"}
                </p>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#A4A8AD] text-sm">
                {moment(post?.createdDate).fromNow()}
              </span>
              {post?.visibility && post?.visibility === "PRIVATE" && (
                <BiSolidLockAlt size={14} color="#A4A8AD" />
              )}
              {post?.visibility && post?.visibility === "PUBLIC" && (
                <FaEarthAmericas size={14} color="#A4A8AD" />
              )}
            </div>
          </div>

          <div
            className="flex justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1 rounded-full transition-colors duration-20 hover:bg-gradient-to-r hover:from-bgColor hover:via-from-bgColor hover:to-from-bgColor">
              <BiDotsHorizontalRounded
                size={25}
                color="#686868"
                className="cursor-pointer "
                onClick={handleClick}
                id="demo-customized-button"
                aria-controls={open ? "demo-customized-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                variant="contained"
              />
              <CustomizeMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                open={open}
                anchor={{ vertical: "top", horizontal: "right" }}
              >
                {token && (
                  <>
                    <MenuItem onClick={() => handleSavePost(post?.id)}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-ascent-1">{t("Lưu")}</span>
                        <FiBookmark
                          color={theme === "light" && "black"}
                          className="text-bgStandard"
                        />
                      </div>
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        handleTranslate({
                          id: post?.id,
                          language: post?.language,
                        })
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-bgStandard">
                          {t("Dịch sang")}{" "}
                          {post?.language === "vi" ? "en" : "vie"}
                        </span>
                        <MdOutlineGTranslate className="text-bgStandard" />
                      </div>
                    </MenuItem>
                    <StyledDivider />
                    {userState?.id !== post?.userId && (
                      <div>
                        <MenuItem onClick={handleClose} disableRipple>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-red-600">{t("Báo cáo")}</span>
                            <TbMessageReport color="red" />
                          </div>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleBlockUser(post?.userId)}
                          disableRipple
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-red-600">{t("Chặn")}</span>
                            <ImUserMinus color="red" />
                          </div>
                        </MenuItem>
                      </div>
                    )}

                    {userState?.id === post?.userId && (
                      <div>
                        <MenuItem
                          onClick={() => handleDeletePost(post?.id)}
                          disableRipple
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-red-600">{t("Xóa")}</span>
                            <FaRegTrashCan color="red" />
                          </div>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setChangeVisibility(true)}
                          disableRipple
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-red-600">
                              {t("Hiển thị")}
                            </span>
                            <FaRegEdit color="red" />
                          </div>
                        </MenuItem>
                      </div>
                    )}
                    <StyledDivider />
                  </>
                )}
                <MenuItem onClick={() => handleSaveUrl(post?.id)}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-bgStandard">
                      {isCopied ? t("Đã sao chép") : t("Sao chép")}
                    </span>
                    <RiAttachment2 className="text-bgStandard" />
                  </div>
                </MenuItem>
              </CustomizeMenu>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-ascent-2">
          {translateLoading ? (
            <Skeleton variant="text" sx={{ width: "100%" }} />
          ) : (
            <>
              {showAll === post?.id
                ? renderContentWithHashtags(post?.content) || ""
                : renderContentWithHashtags(post?.content?.slice(0, 300)) || ""}

              {post?.content &&
                post.content.length > 301 &&
                (showAll === post?.id ? (
                  <span
                    className="text-blue ml-2 font-medium cursor-pointer"
                    onClick={() => setShowAll(0)}
                  >
                    {t("Hiển thị ít hơn")}
                  </span>
                ) : (
                  <span
                    className="text-blue ml-2 font-medium cursor-pointer"
                    onClick={() => setShowAll(post?.id)}
                  >
                    {t("Xem thêm")}
                  </span>
                ))}
            </>
          )}
        </p>

        {post?.imageUrl && post?.imageUrl?.length > 0 && !isShowImage && (
          <>
            <img
              ref={imgRef}
              onClick={handleClickImage}
              src={post?.imageUrl}
              alt="post image"
              className="w-full mt-2 rounded-lg cursor-pointer"
            />
            <DialogCustom
              imageSrc={imagePreview}
              isOpen={openImagePreview}
              handleCloseDiaLogAdd={handleClosePreview}
            />
          </>
        )}

        {post?.video && !isShowImage && (
          <div className="relative">
            <video
              width="100%"
              controls
              className="w-full mt-2 rounded-lg cursor-pointer"
            >
              <source src={post?.video} />
            </video>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2 text-base border-t border-[#66666645]">
        <div className="flex gap-x-3">
          <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer ">
            <div className="relative group">
              {like ? (
                <BiSolidLike
                  size={20}
                  onClick={() => handleLike(post?.id)}
                  className="text-blue-500"
                  color="#0444A4"
                />
              ) : (
                <BiLike size={20} onClick={() => handleLike(post?.id)} />
              )}
            </div>
            <span>{likeCount}</span>
          </div>

          <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer ">
            <div class="relative group">
              {disLike ? (
                <BiSolidDislike
                  size={20}
                  color="#0444A4"
                  onClick={() => handleDisLike(post?.id)}
                  className="text-blue-500"
                />
              ) : (
                <BiDislike size={20} onClick={() => handleDisLike(post?.id)} />
              )}
            </div>
            <span>{dislikeCount}</span>
          </div>

          <p className="flex gap-2 items-center text-base cursor-pointer hover:scale-105 transition-transform">
            <BiCommentDetail
              size={20}
              onClick={() => handleComment(post?.id)}
              className="cursor-pointer"
            />
            {post?.commentCount}
          </p>
          <CreateComment
            open={isOpenReply}
            handleClose={handleCloseReply}
            id={post?.id}
            onCommentSuccess={onSuccessChange}
          />
        </div>
        <div
          onClick={() => handleShare(post?.id)}
          className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer"
        >
          <IoPaperPlaneOutline size={20} />
          {post?.sharedPost}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
