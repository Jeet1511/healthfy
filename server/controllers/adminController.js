import { getRequestCount } from "../services/assistanceService.js";
import { getUserCounts } from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminOverview = asyncHandler(async (req, res) => {
  const [{ totalUsers, totalAdmins }, totalRequests] = await Promise.all([
    getUserCounts(),
    getRequestCount(),
  ]);

  res.status(200).json({
    status: "success",
    message: "Admin route access granted",
    data: {
      totalUsers,
      totalAdmins,
      totalRequests,
    },
  });
});
