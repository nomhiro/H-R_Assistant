import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { MessageType, InitialStateType } from '../types/types';

const initialState: InitialStateType = {};

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    inputMessageToReduxStore: (state, action) => {
      const { pathname, ...messageData } = action.payload;
      if (!state[pathname]) {
        state[pathname] = [];
      }
      state[pathname].push(messageData);
    }
  }
})

export const { inputMessageToReduxStore } = messageSlice.actions;
export const selectMessage = (state: RootState) => state.message;
export default messageSlice.reducer;