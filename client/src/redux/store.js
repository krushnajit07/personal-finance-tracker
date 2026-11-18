import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import budgetReducer from './slices/budgetSlice';
import insightReducer from './slices/insightSlice'
import navigationReducer from './slices/navigationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
    insights: insightReducer,
    navigation: navigationReducer
  }
})

export default store