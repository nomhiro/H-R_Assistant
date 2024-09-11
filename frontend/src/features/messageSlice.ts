import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { MessageType } from '../types/types';

type InitialStateType = {
  onyourdata: MessageType[];
  ragextra1: MessageType[];
  ragextra2: MessageType[];
};

const initialState: InitialStateType = {
  onyourdata: [],
  ragextra1: [],
  ragextra2: [],
};

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    inputMessageToReduxStore: (state, action) => {
      if (action.payload.pathname === '/') {
        state.onyourdata.push(action.payload);
      } else if (action.payload.pathname === '/rag-extra-1') { 
        state.ragextra1.push(action.payload);
      } else if (action.payload.pathname === '/rag-extra-2') { 
        state.ragextra2.push(action.payload);
      }
    },
  },
});

export const { inputMessageToReduxStore } = messageSlice.actions;

export const selectMessage = (state: RootState) => state.message;

export default messageSlice.reducer;
