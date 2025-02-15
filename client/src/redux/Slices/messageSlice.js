import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: null,
    newMessage: null
};

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        createNewMessage(state, action) {
            state.newMessage = action.payload
        },
        getAllMessage(state, action) {
            state.messages = action.payload
        }
    },
});

export const { } = messageSlice.actions

export default messageSlice.reducer;

