import { baseURL } from "~/utils"
import instance from "."

export const friendSuggesstion = async () => {
    return await instance.get(`${baseURL}/profile/users`)
}

export const accept = async (id) => {
    return await instance.post(`${baseURL}/profile/friends/accept?senderUserId=${id}`, {})
}

export const request = async (id) => {
    return await instance.post(`${baseURL}/profile/friends/request?recipientUserId=${id}`, {})
}

export const reject = async (id) => {
    return await instance.post(`${baseURL}/profile/friends/reject?senderUserId=${id}`, {})
}

export const unfriend = async (id) => {
    return await instance.post(`${baseURL}/profile/friends/unfriend?recipientUserId=${id}`, {})
}

export const getFriendOfUser = async ({ id }) => {
    return await instance.get(`${baseURL}/profile/friends/friend?userId=${id}`)
}

export const getFriendRequests = async () => {
    return await instance.get(`${baseURL}/profile/friends/my-friend-request`)
}

export const getRequestSend = async () => {
    return await instance.get(`${baseURL}/profile/friends/request-sent`)
}

export const getMyFriends = async () => {
    return await instance.get(`${baseURL}/profile/friends/my-friends`)
}

