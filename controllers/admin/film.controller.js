const { startSession } = require("mongoose");

const { sendError, getSlug } = require("../../libs/helpers");

const Film = require("../../models/film.model");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete_,
};

function showError(fnc, res, err) {
  console.log(`Error:film.admin.controller.${fnc}: `, err);
  return sendError(res);
}

async function getAll(req, res, next) {
  try {
    const page = {
      current: 1,
      pageSize: 10,
    };
    const query = { deleted: false };
    if (req.query.current) {
      page.current = parseInt(req.query.current);
    }
    if (req.query.pageSize) {
      page.pageSize = parseInt(req.query.pageSize);
    }
    if (req.query.name) {
      query["$or"] = [
        { name: { $regex: new RegExp(req.query.name, "i") } },
        { slug: { $regex: new RegExp(getSlug(req.query.name), "i") } },
      ];
    }
    const films = await Film.find(query)
      .collation({ locale: "vi" })
      .populate("image", ["path"])
      .limit(page.pageSize)
      .skip((page.current - 1) * page.pageSize)
      .sort({ name: -1 });
    page.total = await Film.countDocuments(query);
    res.send({ data: films, meta: page });
  } catch (err) {
    showError("getAll", res, err);
  }
}

async function getById(req, res, next) {
  try {
    const film = await Film.findById(req.params.id).populate("image", ["path"]);
    if (!film) return sendError(res, 404, "Phim không tồn tại");
    res.send(film);
  } catch (err) {
    showError("getById", res, err);
  }
}

async function create(req, res, next) {
  const session = await startSession();
  try {
    const data = JSON.parse(req.body.data);
    const check_exists = await Film.exists({
      slug: data.slug,
      deleted: false,
    });
    if (check_exists) return sendError(res, 409, "Phim đã tồn tại");

    session.startTransaction();

    const dataSave = {
      name: data.name,
      slug: data.slug,
      url: data.url,
      duration: data.duration,
      director: data.director,
      actor: data.actor,
      origin: data.origin,
      content: data.content,
      premiere: data.premiere,
      createdBy: req.user._id,
    };
    if (req.file) {
      const image_uploaded = await uploadImageSharp(req.file);
      const images_data = {
        ...image_uploaded,
        model: "film",
        uploadBy: req.user._id,
      };
      const image = await Image.create([{ ...images_data }], { session });
      if (!image[0]) throw new Error("Create image document error");
      dataSave.image = image[0]._id;
    }
    const film = await Film.create([{ ...dataSave }], { session });
    if (!film[0]) throw new Error("Create film document error");
    await film[0].populate([{ path: "image", select: ["path"] }]);
    await session.commitTransaction();
    res.send(film[0]);
  } catch (err) {
    await session.abortTransaction();
    showError("create", res, err);
  } finally {
    session.endSession();
  }
}

async function update(req, res, next) {
  const session = await startSession();
  try {
    const data = JSON.parse(req.body.data);
    const film = await Film.findOne({ _id: req.params.id });
    if (!film) return sendError(res, 404, "Phim không tồn tại");

    const check_exists = await Film.exists({
      slug: data.slug,
      deleted: false,
      _id: { $ne: req.params.id },
    });
    if (check_exists) return sendError(res, 404, "Phim đã tồn tại");

    session.startTransaction();
    film.name = data.name;
    film.slug = data.slug;
    film.priority = data.priority;
    if (req.file) {
      const image_uploaded = await uploadImageSharp(req.file);
      const images_data = {
        ...image_uploaded,
        model: "film",
        uploadBy: req.user._id,
      };
      const image = await Image.create([{ ...images_data }], { session });
      if (!image[0]) throw new Error("Create image document error");
      film.image = image[0]._id;
    }
    await film.save({ session });
    await film.populate([{ path: "image", select: ["path"] }]);
    await session.commitTransaction();
    res.send(film);
  } catch (err) {
    await session.abortTransaction();
    showError("update", res, err);
  } finally {
    session.endSession();
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
    res.send({ success: true });
  } catch (err) {
    showError("delete_", res, err);
  }
}
