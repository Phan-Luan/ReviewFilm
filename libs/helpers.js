const helper = {
  promisify,
  sendError,
  sendResponse,
};

function promisify(inner) {
  return new Promise((resolve, reject) => {
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function sendError(res, code = 500, msg = "Có lỗi xảy ra") {
  return sendResponse(res, { error: { code, msg } });
}

function sendResponse(res, { data = null, error = null }) {
  if (data) return res.send({ status: 1, data, error: null });

  if (error) return res.send({ status: 0, data: null, error });

  return res.send({
    status: 0,
    data: null,
    error: { code: 500, msg: "Có lỗi xảy ra" },
  });
}

module.exports = helper;
