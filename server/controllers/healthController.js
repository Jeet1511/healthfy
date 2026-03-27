export function healthCheck(req, res) {
  res.status(200).json({
    status: "success",
    message: "Omina API is running",
    timestamp: new Date().toISOString(),
  });
}
