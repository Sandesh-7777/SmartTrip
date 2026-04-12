import { createSlice } from '@reduxjs/toolkit';

const groupSlice = createSlice({
  name: 'group',
  initialState: { groups: [], activeGroup: null },
  reducers: {
    setGroups: (state, action) => { state.groups = action.payload; },
    setActiveGroup: (state, action) => { state.activeGroup = action.payload; },
  },
});

export const { setGroups, setActiveGroup } = groupSlice.actions;
export default groupSlice.reducer;