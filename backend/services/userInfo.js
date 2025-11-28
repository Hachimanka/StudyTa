import UserInfo from "../models/UserInfo.js";

export async function getUserInfo(userId) {
  if (!userId) throw new Error("userId required");
  return await UserInfo.findOne({ userId });
}

export default { getUserInfo };
