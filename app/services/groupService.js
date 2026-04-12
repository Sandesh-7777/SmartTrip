import { supabase } from '../constants/supabase';

// Generate random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new group
export const createGroup = async (userId, userName, userEmail, groupData) => {
  const inviteCode = generateInviteCode();
  const { data, error } = await supabase
    .from('groups')
    .insert([{
      ...groupData,
      created_by: userId,
      invite_code: inviteCode,
      members: [{ userId, userName, userEmail, role: 'admin' }],
    }])
    .select();
  if (error) throw error;

  // Add creator as member
  await supabase.from('group_members').insert([{
    group_id: data[0].id,
    user_id: userId,
    user_name: userName,
    user_email: userEmail,
    role: 'admin',
  }]);

  return data[0];
};

// Get all groups for a user
export const getUserGroups = async (userId) => {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);
  if (error) throw error;

  if (data.length === 0) return [];

  const groupIds = data.map((d) => d.group_id);
  const { data: groups, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false });
  if (groupError) throw groupError;
  return groups;
};

// Get group by invite code
export const getGroupByInviteCode = async (code) => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single();
  if (error) throw error;
  return data;
};

// Join a group
export const joinGroup = async (groupId, userId, userName, userEmail) => {
  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (existing && existing.length > 0) {
    throw new Error('You are already a member of this group.');
  }

  const { error } = await supabase.from('group_members').insert([{
    group_id: groupId,
    user_id: userId,
    user_name: userName,
    user_email: userEmail,
    role: 'member',
  }]);
  if (error) throw error;
};

// Get group members
export const getGroupMembers = async (groupId) => {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId);
  if (error) throw error;
  return data;
};

// Delete group
export const deleteGroup = async (groupId) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);
  if (error) throw error;
};