import { baseURL } from "~/utils"
import instance from "."

export const searchUser = async ({ keyword }) => {
    return await instance.get(`${baseURL}/profile/search?page=0&size=10&search=${keyword}`)
}

export const searchPost = async ({ size, page, keyword }) => {
    return await instance.get(`${baseURL}/post/search?page=${page}&size=${size}&content=${keyword}`)
}

export const searchPostByKeyword = async ({ keyword }) => {
    return await instance.get(`${baseURL}/post/searchPostKeyword?keyword=${keyword}`)
}

export const searchPostByHashTag = async ({ hashtag }) => {
    return await instance.get(`${baseURL}/post/hashtags/${hashtag}/posts`)
}