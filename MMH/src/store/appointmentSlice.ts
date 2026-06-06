import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppointmentState {
  selectedDoctorId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
}

const initialState: AppointmentState = {
  selectedDoctorId: null,
  selectedDate: null,
  selectedTime: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    selectDoctor: (state, action: PayloadAction<string>) => {
      state.selectedDoctorId = action.payload;
    },
    selectDateTime: (state, action: PayloadAction<{ date: string; time: string }>) => {
      state.selectedDate = action.payload.date;
      state.selectedTime = action.payload.time;
    },
    clearAppointment: (state) => {
      state.selectedDoctorId = null;
      state.selectedDate = null;
      state.selectedTime = null;
    },
  },
});

export const { selectDoctor, selectDateTime, clearAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
