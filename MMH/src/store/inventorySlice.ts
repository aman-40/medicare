import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface InventoryState {
  medicines: Product[];
  frames: Product[];
  lenses: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  medicines: [],
  frames: [],
  lenses: [],
  isLoading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setMedicines: (state, action: PayloadAction<Product[]>) => {
      state.medicines = action.payload;
    },
    setFrames: (state, action: PayloadAction<Product[]>) => {
      state.frames = action.payload;
    },
    setLenses: (state, action: PayloadAction<Product[]>) => {
      state.lenses = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setMedicines, setFrames, setLenses, setLoading, setError } = inventorySlice.actions;
export default inventorySlice.reducer;
