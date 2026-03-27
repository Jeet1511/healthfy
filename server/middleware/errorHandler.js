export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status,
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
