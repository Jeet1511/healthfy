import { resourceData } from "../data/resourcesMockData.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedTypes = [
  "hospital",
  "doctor",
  "clinic",
  "pharmacy",
  "bloodbank",
  "police",
  "fire",
  "shelter",
  "helpcenter",
  "community",
];

export const listResources = asyncHandler(async (req, res) => {
  const type = String(req.query.type || "all").toLowerCase();
  const search = String(req.query.search || "").toLowerCase();
  const normalizedType = type === "all" || allowedTypes.includes(type) ? type : "all";

  const filtered = resourceData.filter((item) => {
    const typeMatch = normalizedType === "all" ? true : item.type === normalizedType;
    const searchMatch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.address.toLowerCase().includes(search);

    return typeMatch && searchMatch;
  });

  res.status(200).json({
    status: "success",
    filters: {
      type: normalizedType,
      search,
    },
    data: filtered,
  });
});
