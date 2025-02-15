import { baseURL } from "~/utils"
import instance from "."

export const deleteUser = async (id) => {
    return await instance.delete(`${baseURL}/identity/users/admin/delete/${id}`)
}

export const getAllUsers = async ({ page, size }) => {
    return await instance.get(`${baseURL}/identity/users?page=${page}&size=${size}`)
}

export const getAllPosts = async ({ page, size }) => {
    return await instance.get(`${baseURL}/post/all?page${page}&size=${size}`)
}

export const getAllGroups = async ({ page, size }) => {
    return await instance.get(`${baseURL}/identity/groups/all?page${page}&size=${size}`)
}

export const getHistoryPosts = async ({ page, size }) => {
    return await instance.get(`${baseURL}/post/history?page=${page}&size=${size}`)
}