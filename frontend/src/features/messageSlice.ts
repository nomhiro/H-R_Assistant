import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { MessageType } from '../types/types';

type InitialStateType = {
  houseAssistant: MessageType[];
};

const initialState: InitialStateType = {
  houseAssistant: [],
};

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    inputMessageToReduxStore: (state, action) => {
      if (action.payload.pathname === '/') {
        state.houseAssistant.push(action.payload);
      }
    },
  },
});

export const { inputMessageToReduxStore } = messageSlice.actions;

export const selectMessage = (state: RootState) => state.message;

export default messageSlice.reducer;
