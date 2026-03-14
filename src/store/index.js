import { configureStore, createSlice } from "@reduxjs/toolkit";

// ---- UI Slice ----
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    selectedSex: null,
    selectedUchastka: null,
    theme: "dark",
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setSelectedSex: (state, action) => {
      state.selectedSex = action.payload;
    },
    setSelectedUchastka: (state, action) => {
      state.selectedUchastka = action.payload;
    },
  },
});

// ---- Ogohlantirish Slice ----
const ogohlantirishSlice = createSlice({
  name: "ogohlantirishlar",
  initialState: {
    filter: { daraja: "", holat: "" },
    selectedId: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = { daraja: "", holat: "" };
    },
    setSelectedId: (state, action) => {
      state.selectedId = action.payload;
    },
  },
});

// ---- Datchik Slice ----
const datchikSlice = createSlice({
  name: "datchiklar",
  initialState: {
    filter: { sexId: "", tur: "" },
    viewMode: "grid",
  },
  reducers: {
    setDatchikFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
  },
});

// ---- Uskuna Slice ----
const uskunaSlice = createSlice({
  name: "uskunalar",
  initialState: {
    filter: { sexId: "", holat: "", uchastkId: "" },
    selectedId: null,
  },
  reducers: {
    setUskunaFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setUskunaSelected: (state, action) => {
      state.selectedId = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setSelectedSex,
  setSelectedUchastka,
} = uiSlice.actions;
export const { setFilter, clearFilter, setSelectedId } =
  ogohlantirishSlice.actions;
export const { setDatchikFilter, setViewMode } = datchikSlice.actions;
export const { setUskunaFilter, setUskunaSelected } = uskunaSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    ogohlantirishlar: ogohlantirishSlice.reducer,
    datchiklar: datchikSlice.reducer,
    uskunalar: uskunaSlice.reducer,
  },
});
