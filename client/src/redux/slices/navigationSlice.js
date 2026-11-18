import { createSlice } from '@reduxjs/toolkit'

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    isMobileMenuOpen: false
  },
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false
    }
  }
})

export const { toggleMobileMenu, closeMobileMenu } = navigationSlice.actions
export default navigationSlice.reducer
