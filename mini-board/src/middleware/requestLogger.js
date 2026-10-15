export function addRequestTime(req, res, next) {
  req.requestTime = new Date().toISOString();

  // next()를 호출해야 다음 미들웨어나 라우트로 요청이 넘어갑니다.
  next();
}

export function requestLogger(req, res, next) {
  console.log(`[${req.requestTime}] ${req.method} ${req.originalUrl}`);
  next();
}
