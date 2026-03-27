import { resourceData } from "../data/resourcesMockData.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedTypes = ["hospital", "police", "fire", "shelter"];

export const listResources = asyncHandler(async (req, res) => {
  const type = String(req.query.type || "all").toLowerCase();
  const search = String(req.query.search || "").toLowerCase();

  const filtered = resourceData.filter((item) => {
    const typeMatch = type === "all" ? true : item.type === type;
    const searchMatch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.address.toLowerCase().includes(search);

    return typeMatch && searchMatch;
  });

  res.status(200).json({
    status: "success",
    filters: {
      type: type === "all" || allowedTypes.includes(type) ? type : "all",
      search,
    },
    data: filtered,
  });
});
