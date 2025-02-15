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

    return await instance.post(`${baseURL}/post/group/post-file`, formData);
};

export const getAllPosts = async ({ id, page, size }) => {
    return await instance.get(`${baseURL}/post/group/all?page=${page}&size=${size}&groupId=${id}`)
}

export const changeVisibility = async (id) => {
    return await instance.get(`${baseURL}/identity/groups/${id}/visibility?newVisibility=PRIVATE`)
}

export const getAllGroup = async ({ page, size }) => {
    return await instance.get(`${baseURL}/identity/groups/all?page=${page}&size=${size}`)
}

export const getUserPosts = async ({ userId, groupId }) => {
    return await instance.get(`${baseURL}/post/group/all?page=${page}&size=${size}&userId=${userId}&groupId=${groupId}`)
}

export const createGroup = async ({ data }) => {
    return await instance.post(`${baseURL}/identity/groups`, data);

};

export const getDetailGroup = async (id) => {
    return await instance.get(`${baseURL}/identity/groups/${id}`);
};

export const deletePost = async (id) => {
    return await instance.delete(`${baseURL}/post/group/${id}`);
};

export const addUserToGroup = async ({ userId, groupId }) => {
    return await instance.post(`${baseURL}/identity/groups/${groupId}/members/${userId}`, {});
};

export const isUserInGroup = async (userId) => {
    return await instance.get(`${baseURL}/identity/groups/${userId}/isUserInGroup`);
};




