import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chats: [],
    createdGroup: null,
    createdChat: null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        createChat(state, action) {
            state.createdChat = action.payload
        },
        createGroup(state, action) {
            state.createdGroup = action.payloads
        },
        getUsersChat(state, action) {
            state.chats = action.payload
        }
    },
});

export const { createChat, createGroup, getUsersChat } = chatSlice.actions

export default chatSlice.reducer;

