import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearCurrentUser: state => {
      state.currentUser = null;
    },
  },
});

export const {
  setCurrentUser,
  setUsers,
  addUser,
  removeUser,
  setLoading,
  clearCurrentUser,
} = userSlice.actions;
export default userSlice.reducer;
