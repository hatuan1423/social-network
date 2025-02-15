import instance from ".";
import { baseURL } from "~/utils";

export const createPost = async ({ data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.post(`${baseURL}/post/post-file`, formData);
};

export const getMyPosts = async () => {
    return await instance.get(`${baseURL}/post/my-posts`)
}

export const translatePost = async ({ id, language }) => {
    return await instance.post(`${baseURL}/post/${id}/translate?targetLanguage=${language}`, {})
}

export const getPostsBySentiment = async ({ page, sentiment, size = 10 }) => {
    return await instance.get(`${baseURL}/post/by-sentiment?page=${page}&size=${size}&sentiment=${sentiment}`)
}

export const getPostsById = async ({ id, page }) => {
    return await instance.get(`${baseURL}/post/user-posts?page=${page}&size=10&userId=${id}`)
}

export const getAllPosts = async (page) => {
    return await instance.get(`${baseURL}/post/all?page=${page}`)
}

export const deletePost = async ({ id }) => {
    return await instance.delete(`${baseURL}/post/${id}`)
}

export const comment = async ({ id, data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.post(`${baseURL}/post/${id}/comment-file`, formData)
}

export const likeComment = async ({ id }) => {
    return await instance.post(`${baseURL}/post/${id}/comment-file`, formData)
}

export const deleteComment = async ({ postId, commentId }) => {
    return await instance.delete(`${baseURL}/post/${postId}/comments/${commentId}`)
}

export const editComment = async ({ postId, commentId, data }) => {
    return await instance.put(`${baseURL}/post/${postId}/comments/${commentId}`, data)
}

export const like = async ({ id, emoji }) => {
    return await instance.post(`${baseURL}/post/${id}/like?emoji=${emoji}`, {})
}

export const dislike = async ({ id }) => {
    return await instance.post(`${baseURL}/post/${id}/unlikes`, {})
}

export const share = async ({ id }) => {
    return await instance.post(`${baseURL}/post/${id}/share`, {})
}

export const save = async ({ id }) => {
    return await instance.post(`${baseURL}/post/${id}/save`, {})
}

export const unsave = async (id) => {
    return await instance.post(`${baseURL}/post/${id}/unsave`, {})
}

export const getSaveds = async () => {
    return await instance.get(`${baseURL}/post/saved-posts`)
}

export const getPostById = async ({ id }) => {
    return await instance.get(`${baseURL}/post/${id}`)
}

export const changeVisibility = async ({ id, visibility }) => {
    return await instance.post(`${baseURL}/post/${id}/change-visibility?postId=${id}&visibility=${visibility}`, {})
}

