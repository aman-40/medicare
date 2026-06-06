import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import appointmentReducer from './appointmentSlice';
import inventoryReducer from './inventorySlice';
import queueReducer from './queueSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    appointment: appointmentReducer,
    inventory: inventoryReducer,
    queue: queueReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
