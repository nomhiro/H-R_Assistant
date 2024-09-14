import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import messageReducer from '../features/messageSlice';

import { projectSlice } from '@/features/rag-extra-2/projectSlice';

export const store = configureStore({
  reducer: {
    message: messageReducer,
    [projectSlice.reducerPath]: projectSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
