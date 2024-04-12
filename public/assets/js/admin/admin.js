$(function () {
  const path = location.pathname.split("/")[2];
  if (path === undefined) {
    eventShowTrailer();
  }
  if (path === "login") eventLogin();
  if (path === "film") {
    eventDeleteFilm();
    eventResetFormFilm();
    eventCreateFilm();
    eventEditFilm();
    eventUpdateFilm();
    updateIsHidden();
    eventSearchFilm();
  }
  if (path === "user") {
    eventResetFormUser();
    updateActiveUser();
    eventDeleteUser();
    eventCreateUser();
    eventEditUser();
    eventUpdateUser();
    eventSearchUser();
  }
  if (path === "review") {
    updateIsHiddenReview();
    eventDeleteReview();
    eventSearchReview();
  }
  $("#admin-logout").click(function () {
    localStorage.removeItem("jwt-admin");
  });
  const token = localStorage.getItem("jwt-admin");
  token ? $("#admin-sign-in").remove() : $("#admin-logout").remove();
  const admin = localStorage.getItem("admin-detail");
  admin.name ? $("#name-admin").text(admin.name) : "";
});

function eventShowTrailer() {
  $("#listFilmAdmin").on(
    "click",
    ".admin-play-trailer,.play-trailer-img-admin",
    function () {
      $("#modalShowFilmAdmin").html("");
      const idTrailer = $(this).data("id-trailer-admin");
      const nameFilm = $(this).data("name-trailer-admin");
      const createIframe = `<iframe width="100%" height="432" src="https://www.youtube.com/embed/${idTrailer}"
                  title="${nameFilm}" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>`;
      $("#modalShowFilmAdmin").append(createIframe);
    }
  );
  $("#closeModalShowTrailerAdmin").click(function () {
    $("#modalShowFilmAdmin").html("");
  });
  $("#modalShowTrailerAdmin").click(function () {
    $("#modalShowFilmAdmin").html("");
  });
}

function eventSearchUser() {
  $(".form-search-user-admin").on("click", ".btn-search-user", function () {
    let textSearch = $(".text-search-user").val();
    textSearch = convertToSlug(textSearch);
    window.location.href = `/admin/user/users?name=${textSearch}`;
  });
  $(".form-search-user-admin").on(
    "click",
    ".btn-remove-search-user",
    function () {
      window.location.href = `/admin/user/users`;
    }
  );
}

function eventSearchReview() {
  $(".form-search-review-admin").on("click", ".btn-search-review", function () {
    let textSearch = $(".text-search-review").val();
    textSearch = convertToSlug(textSearch);
    window.location.href = `/admin/review/reviews?name=${textSearch}`;
  });
  $(".form-search-review-admin").on(
    "click",
    ".btn-remove-search-review",
    function () {
      window.location.href = `/admin/review/reviews`;
    }
  );
}

function eventSearchFilm() {
  $(".form-search-film-admin").on("click", ".btn-search-film", function () {
    let textSearch = $(".text-search-film").val();
    textSearch = convertToSlug(textSearch);
    window.location.href = `/admin/film/films?name=${textSearch}`;
  });
  $(".form-search-film-admin").on(
    "click",
    ".btn-remove-search-film",
    function () {
      window.location.href = `/admin/film/films`;
    }
  );
}

function createError(condition, el, msg) {
  let err = $(`#${el}`);
  return condition ? err.text(msg) : err.text("");
}

function eventUpdateUser() {
  $("#btn-update-user").click(async function () {
    const name = $("#create-user-name").val();
    const password = $("#create-user-password").val();
    const image = $("#create-user-image").prop("files")[0];
    const formData = new FormData();
    formData.append("name", name);
    formData.append("password", password);
    if (image) formData.append("image", image);
    const res = await updateUser(formData);
    $("#modalUser").modal("hide");
    $(".modal-backdrop").remove();
    $(`#${res._id}`).html("");
    const newUser = `<td>
                          ${res.name}
                        </td>
                        <td>
                          ${res.email}
                        </td>
                        <td>
                          <img src="/assets/images/${res.image}" alt="thumbnail" width="100">
                        </td>
                        <td>
                          <div class="form-check form-switch d-flex justify-content-center align-items-center">
                            <input class="form-check-input" type="checkbox" data-user-active="${res._id}"
                              id="btn-active-user"${res.active ? "checked" : ""}
                          </div>
                        </td>
                        <td>
                          <button data-bs-toggle="modal" data-bs-target="#modalUser" class="btn btn-primary btn-edit-user"
                            data-user-id="<%= user._id %>">Sửa</button>

                          <button data-bs-toggle="modal" data-bs-target="#modalDeleteUser" data-user-id="<%= user._id %>"
                            class="btn btn-danger btn-delete-user" type="submit">Xoá</button>
                        </td>`;
    $(`#${res._id}`).append(newUser);
  });
}

async function updateUser(data) {
  try {
    const id = $("#userId").val();
    let res = await putformData(`/admin/user/users/${id}`, data);
    if (res.error) {
      console.error(res.error);
    }
    return res.json();
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

function eventDeleteReview() {
  $(".btn-delete-review").click(function () {
    const reviewId = $(this).data("review-id");
    $("#btn-confirm-delete-review").click(async function () {
      await fetch(`/admin/review/reviews/${reviewId}`, { method: "DELETE" });
      $("#modalDeleteReview").modal("hide");
      $(".modal-backdrop").remove();
      $(`#${reviewId}`).remove();
    });
  });
}

function updateIsHiddenReview() {
  $(".btn-hidden-review").click(async function () {
    var reviewId = $(this).data("review-hidden");
    await putformData(`/admin/review/reviews/isHidden/${reviewId}`);
  });
}

function eventLogin() {
  $("#btn-admin-login").click(async function () {
    const username = $("#admin-login-username").val();
    const password = $("#admin-login-password").val();
    createError(
      username.trim() === "",
      "admin-login-username-err",
      "Không được để trống username"
    );
    createError(
      password.trim() === "",
      "admin-login-password-err",
      "Không được để trống mật khẩu"
    );
    if (username && password) {
      await login({ username, password });
    }
  });
}

function eventDeleteFilm() {
  $(".btn-delete-film").click(function () {
    const filmId = $(this).data("film-id");
    $("#btn-confirm-delete-film").click(async function () {
      const res = await fetch(`/admin/film/films/${filmId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log(data);
      if (data.success == true) {
        $("#modalDeleteFilm").modal("hide");
        $(".modal-backdrop").remove();
        toastr.success("Đã xoá phim", "Success!", {
          timeOut: 5000,
        });
        $(`#${filmId}`).remove();
      } else {
        toastr.error("Xoá thất bại", "Error!", {
          timeOut: 5000,
        });
      }
    });
  });
}

function eventDeleteUser() {
  $(".btn-delete-user").click(function () {
    const userId = $(this).data("user-id");
    console.log(userId);
    $("#btn-confirm-delete-user").click(async function () {
      await fetch(`/admin/user/users/${userId}`, { method: "DELETE" });
      $("#modalDeleteUser").modal("hide");
      $(".modal-backdrop").remove();
      $(`#${userId}`).remove();
    });
  });
}

function eventResetFormFilm() {
  $("#btn-create-film-admin").click(function () {
    $("#modal-film-title").text("Create review film");
    $("#create-film-name").val("");
    $("#create-film-trailer").val("");
    $("#create-film-content").val("");
    $("#create-film-director").val("");
    $("#create-film-actor").val("");
    $("#create-film-duration").val("");
    $("#create-film-origin").val("");
    $("#create-film-premiere").val("");
    $("#thumbnail").html("");
    $("#btn-create-film").css("display", "block");
    $("#btn-update-film").css("display", "none");
  });
}
function eventResetFormUser() {
  $("#btn-create-user-admin").click(function () {
    $("#modal-user-title").text("Create user");
    $("#create-user-name").val("");
    $("#create-user-email").val("");
    $("#create-user-password").val("");
    $("#thumbnail-user").html("");
    $("#create-user-email").attr("disabled", false);
    $("#btn-create-user").css("display", "block");
    $("#btn-update-user").css("display", "none");
  });
}

function eventEditUser() {
  $(".btn-edit-user").on("click", async function () {
    $("#modal-user-title").text("Update user");
    $("#btn-create-user").css("display", "none");
    $("#btn-update-user").css("display", "block");
    const userId = $(this).data("user-id");
    const user = await getById("/admin/user/users", userId);
    $("#create-user-name").val(user.name);
    $("#create-user-email").val(user.email);
    $("#create-user-email").attr("disabled", true);
    $("#create-user-password").val(user.password);
    $("#thumbnail-user").html(
      `<img class="my-2" id="thumbnail-film" width="100" src="/assets/images/${user.image}" alt="Thumbnail">
      <input type="hidden" id="userId" value="${user._id}">
      `
    );
  });
}

function eventEditFilm() {
  $(".btn-edit-film").click(async function () {
    $("#modal-film-title").text("Update review film");
    $("#btn-create-film").css("display", "none");
    $("#btn-update-film").css("display", "block");
    var filmId = $(this).data("film-id");
    const film = await getById("/admin/film/films", filmId);
    const dateObj = new Date(film.premiere);
    const year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();
    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
    const premiere = `${year}-${month}-${day}`;
    $("#create-film-name").val(film.name);
    $("#create-film-trailer").val(film.trailerId);
    $("#create-film-content").val(film.content);
    $("#create-film-director").val(film.director);
    $("#create-film-actor").val(film.actor);
    $("#create-film-duration").val(film.duration);
    $("#create-film-origin").val(film.origin);
    $("#create-film-premiere").val(premiere);
    $("#thumbnail").html(
      `<img class="my-2" id="thumbnail-film" width="100" src="/assets/images/${film.image}" alt="Thumbnail">
      <input type="hidden" id="filmID" value="${film._id}">
      `
    );
    eventUpdateFilm();
  });
}

function eventCreateUser() {
  $("#btn-create-user").click(async function () {
    const name = $("#create-user-name").val();
    const email = $("#create-user-email").val();
    const password = $("#create-user-password").val();
    const image = $("#create-user-image").prop("files")[0];
    createError(
      name.trim() === "",
      "create-user-name-err",
      "Tên không được để trống"
    );
    createError(
      email.trim() === "",
      "create-user-email-err",
      "Email không được để trống"
    );
    createError(
      password.trim() === "",
      "create-user-password-err",
      "Mật khẩu không được để trống"
    );
    createError(
      image === undefined,
      "create-user-image-err",
      "Avatar không được để trống"
    );
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("image", image);
    const res = await createUser(formData);
    if (res.error) {
      createError(true, "create-user-email-err", "Email đã tồn tại");
    }
    if (res.user) {
      $("#modalUser").modal("hide");
      $(".modal-backdrop").remove();
      toastr.success("Thêm người dùng thành công", "Success!", {
        timeOut: 5000,
      });
      const newUser = `
                      <tr id="${res.user._id}">
                      <td>
                        ${res.user.name}
                      </td>
                      <td>
                        ${res.user.email}
                      </td>
                      <td>
                        <img src="/assets/images/${res.user.image}" alt="thumbnail" width="100">
                      </td>
                      <td>
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" data-user-active="${res.user._id}"
                            id="btn-active-user" checked>
                        </div>
                      </td>
                      <td>
                        <button data-bs-toggle="modal" data-bs-target="#modalUesr" class="btn btn-primary btn-edit-res.user"
                          data-user-id="${res.user._id}">Sửa</button>

                        <button data-bs-toggle="modal" data-bs-target="#modalDeleteUser" data-user-id="${res.user._id}"
                          class="btn btn-danger btn-delete-user" type="submit">Xoá</button>
                      </td>
                    </tr>
    `;
      $("#userList").append(newUser);
    }
  });
}

function eventCreateFilm() {
  $("#btn-create-film").click(async function () {
    const name = $("#create-film-name").val();
    let trailerURL = $("#create-film-trailer").val();
    const content = $("#create-film-content").val();
    const director = $("#create-film-director").val();
    const actor = $("#create-film-actor").val();
    const duration = $("#create-film-duration").val();
    const origin = $("#create-film-origin").val();
    const premiere = $("#create-film-premiere").val();
    const image = $("#create-film-image").prop("files")[0];
    const trailerId = trailerURL.split("=")[1];
    const formData = new FormData();
    formData.append("name", name);
    formData.append("trailerId", trailerId);
    formData.append("content", content);
    formData.append("director", director);
    formData.append("actor", actor);
    formData.append("duration", duration);
    formData.append("origin", origin);
    formData.append("premiere", premiere);
    formData.append("image", image);
    const res = await createFilm(formData);
    if (res.error) {
      return toastr.error(res.error.msg, "Lỗi!", {
        timeOut: 5000,
      });
    }
    if (res.film) {
      $("#modalFilm").modal("hide");
      $(".modal-backdrop").remove();
      toastr.success("Thêm phim mới thành công", "Success!", {
        timeOut: 5000,
      });
      const newFilm = `
      <tr id="${res.film._id}">
        <td>${res.film.name}</td>
        <td><img src="/assets/images/${res.film.image}" alt="thumbnail" width="100"></td>
        <td>${res.film.duration}</td>
        <td>${res.film.director}</td>
        <td>${res.film.actor}</td>
        <td>${res.film.origin}</td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" data-film-hidden="${res.film._id}" checked>
          </div>
        </td>
        <td>
          <button data-bs-toggle="modal" data-bs-target="#modaFilm" class="btn btn-primary btn-edit-film" data-film-id="${res.film._id}">Sửa</button>
          <button data-bs-toggle="modal" data-bs-target="#modalDeleteFilm" data-film-id="${res.film._id}" class="btn btn-danger btn-delete-film" type="submit">Xoá</button>
        </td>
      </tr>
      `;
      $("#filmList").append(newFilm);
    }
  });
}

function eventUpdateFilm() {
  $("#btn-update-film").click(async function () {
    const name = $("#create-film-name").val();
    const trailerURL = $("#create-film-trailer").val();
    const content = $("#create-film-content").val();
    const director = $("#create-film-director").val();
    const actor = $("#create-film-actor").val();
    const duration = $("#create-film-duration").val();
    const origin = $("#create-film-origin").val();
    const premiere = $("#create-film-premiere").val();
    const image = $("#create-film-image").prop("files")[0];
    const trailerId = trailerURL.includes("=")
      ? trailerURL.split("=")[1]
      : trailerURL;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("trailerId", trailerId);
    formData.append("content", content);
    formData.append("director", director);
    formData.append("actor", actor);
    formData.append("duration", duration);
    formData.append("origin", origin);
    formData.append("premiere", premiere);
    if (image) formData.append("image", image);
    await updateFilm(formData);
    $("#modalFilm").modal("hide");
    $(".modal-backdrop").remove();
  });
}

async function createUser(data) {
  try {
    let res = await postformData("/admin/user/users", data);
    if (res.error) {
      return res;
    }
    return res.json();
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

async function createFilm(data) {
  try {
    let res = await postformData("/admin/film/films", data);
    if (res.error) {
      toastr.error(res.error.msg, "Thêm phim thất bại!", {
        timeOut: 5000,
      });
    }
    return res.json();
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

async function updateFilm(data) {
  try {
    const id = $("#filmID").val();
    let res = await putformData(`/admin/film/films/${id}`, data);
    if (res.error) {
      toastr.error(res.error.msg, "Cập nhật phim thất bại!", {
        timeOut: 5000,
      });
    }
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

function updateIsHidden() {
  $(".btn-hidden").click(async function () {
    var filmId = $(this).data("film-hidden");
    await putformData(`/admin/film/films/isHidden/${filmId}`);
  });
}

function updateActiveUser() {
  $("#btn-active-user").click(async function () {
    var userId = $(this).data("user-active");
    await putformData(`/admin/user/users/active/${userId}`);
  });
}

async function login(data) {
  try {
    let res = await postJson("/admin/login", data);
    if (res.error) {
      toastr.error(res.error.msg, "Đăng nhập thất bại!", {
        timeOut: 5000,
      });
    } else {
      if (res.accessToken) {
        localStorage.setItem("admin-detail", res.user);
        localStorage.setItem("jwt-admin", `Beaer ${res.accessToken}`);
        window.location.href = "/admin";
      }
    }
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
    toastr.error(e, "Có lỗi xảy ra", {
      timeOut: 5000,
    });
  }
}

async function postformData(url, formData) {
  try {
    const token = localStorage.getItem("jwt-admin") || "";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: token,
      },
      body: formData,
    });

    if (!res.ok) {
      return toastr.error("", "Tạo thất bại!", {
        timeOut: 5000,
      });
    }
    return res;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function putformData(url, formData) {
  try {
    const token = localStorage.getItem("jwt-admin") || "";

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        authorization: token,
      },
      body: formData,
    });

    if (!res.ok) {
      return toastr.error("", "Cập nhật thất bại!", {
        timeOut: 5000,
      });
    }
    return res;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function postJson(url, data) {
  const token = localStorage.getItem("jwt-admin") || "";

  let res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: token,
    },
    body: data ? JSON.stringify(data) : {},
  });

  return await res.json();
}

async function getById(url, id) {
  const response = await fetch(`${url}/${id}`);
  const data = await response.json();
  return data;
}

function convertToSlug(str) {
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
  str = str.replace(/(đ)/g, "d");
  str = str.replace(/([^0-9a-z-\s])/g, "");
  str = str.replace(/- /g, "");
  str = str.replace(/(\s+)/g, "-");
  str = str.replace(/^-+/g, "");
  str = str.replace(/-+$/g, "");
  return str;
}
