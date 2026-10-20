export function getHealth(req, res) {
  res.json({
    status: "ok",
    project: "mini-board",
    step: 12,
    requestTime: req.requestTime
  });
}
