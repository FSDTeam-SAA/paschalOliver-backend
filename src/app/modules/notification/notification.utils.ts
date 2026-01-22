export const buildUserSnapshot = (user: any) => ({
  id: user._id,
  name: `${user.name ?? ''} ${user.surname ?? ''}`.trim(),
  role: user.role,
  avatar: user.avatar,
});
