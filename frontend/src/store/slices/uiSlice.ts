import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  isDarkMode: boolean;
  theme: 'light' | 'dark';
  modalOpen: string | null;
  modalData: any;
}

const getInitialDarkMode = () => {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  isDarkMode: getInitialDarkMode(),
  theme: getInitialDarkMode() ? 'dark' : 'light',
  modalOpen: null,
  modalData: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.theme = state.isDarkMode ? 'dark' : 'light';
      localStorage.setItem('darkMode', String(state.isDarkMode));
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.theme = action.payload ? 'dark' : 'light';
      localStorage.setItem('darkMode', String(action.payload));
    },
    openModal: (state, action: PayloadAction<{ modal: string; data?: any }>) => {
      state.modalOpen = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modalOpen = null;
      state.modalData = null;
    },
    openMobileSidebar: (state) => {
      state.mobileSidebarOpen = true;
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  toggleSidebarCollapsed,
  toggleDarkMode,
  setDarkMode,
  openModal,
  closeModal,
  openMobileSidebar,
  closeMobileSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
