import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface QueueState {
  currentToken: number | null;
  myToken: number | null;
  estimatedWaitTime: number | null; // in minutes
}

const initialState: QueueState = {
  currentToken: null,
  myToken: null,
  estimatedWaitTime: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setCurrentToken: (state, action: PayloadAction<number>) => {
      state.currentToken = action.payload;
    },
    setMyToken: (state, action: PayloadAction<number>) => {
      state.myToken = action.payload;
    },
    setWaitTime: (state, action: PayloadAction<number>) => {
      state.estimatedWaitTime = action.payload;
    },
  },
});

export const { setCurrentToken, setMyToken, setWaitTime } = queueSlice.actions;
export default queueSlice.reducer;
