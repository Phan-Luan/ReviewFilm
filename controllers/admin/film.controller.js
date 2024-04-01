const { sendError } = require("../../libs/helpers");

const Film = require("../../models/film.model");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete_,
  updateFilmIsHidden,
};

function showError(fnc, res, err) {
  console.log(`Error:film.admin.controller.${fnc}: `, err);
  return sendError(res);
}

async function getAll(req, res, next) {
  try {
    const query = { deleted: false };
    const page = { current: 1, pageSize: 4 };
    if (req.query.page) {
      page.current = parseInt(req.query.page);
    }
    if (req.query.name) {
      query["$or"] = [
        { name: { $regex: new RegExp(req.query.name, "i") } },
        { slug: { $regex: new RegExp(req.query.name, "i") } },
      ];
    }
    const films = await Film.find(query)
      .collation({ locale: "vi" })
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort({ name: -1 });
    const totalFilm = await Film.countDocuments(query);
    page.totalPage = Math.ceil(totalFilm / page.pageSize);
    res.render("admin/film", {
      films,
      page,
    });
  } catch (err) {
    showError("getAll", res, err);
  }
}

async function getById(req, res, next) {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return sendError(res, 404, "Phim không tồn tại");
    res.send(film);
  } catch (err) {
    showError("getById", res, err);
  }
}

async function create(req, res, next) {
  try {
    const data = req.body;
    data.createBy = req.user._id;
    if (req.file) data.image = req.file.filename;
    const check_exists = await Film.exists({
      slug: data.slug,
      deleted: false,
    });
    if (check_exists) return sendError(res, 422, "Phim đã tồn tại");

    const film = await Film.create(data);
    res.send({ film });
  } catch (err) {
    showError("create", res, err);
  }
}

async function update(req, res, next) {
  try {
    const data = req.body;
    if (req.file) {
      data.image = req.file.path;
    }
    data.updateBy = req.user._id;
    let film = await Film.findById(req.params.id);
    if (!film) return sendError(res, 404, "Phim không tồn tại");

    const newFilm = await Film.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.send(newFilm);
  } catch (err) {
    showError("update", res, err);
  }
}

async function delete_(req, res, next) {
  try {
    const film = await Film.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!film) return sendError(res, 404, "Phim không tồn tại");
    return res.send({ success: true });
  } catch (err) {
    showError("delete_", res, err);
  }
}

async function updateFilmIsHidden(req, res, next) {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return sendError(res, 404, "Phim không tồn tại");
    if (film.isHidden === false) {
      film.isHidden = true;
    } else {
      film.isHidden = false;
    }
    film.save();
    res.send({ success: true });
  } catch (err) {
    console.log("Error:admin.controller.updateFilmIsHidden: ", err);
    return sendError(res);
  }
}
