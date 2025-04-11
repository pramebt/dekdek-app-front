import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './user-slice'; // นำเข้า userReducer

export const store = configureStore({
    reducer: {
        user: userReducer, // เพิ่ม userReducer ใน store
        // คุณสามารถเพิ่ม reducers อื่นๆ ที่นี่
    }
});