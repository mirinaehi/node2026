export function getHealth(req, res) {
  res.json({
    status: "ok",
    project: "mini-board",
    step: 13,
    requestTime: req.requestTime
  });
}
