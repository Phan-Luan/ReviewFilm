$(function () {
  const path = location.pathname.split("/")[1];
  if (path === "login") eventLogin();
  if (path === "register") eventRegister();
  eventSearchFilm();
});

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

function eventSearchFilm() {
  $("#form-search-film").on(
    "input",
    debounce(async function () {
      const nameSearch = $("#form-search-film").val();
      const name = convertToSlug(nameSearch);
      localStorage.setItem("searchTextHome", nameSearch);
      const data = await searchFilm(name);
      $("#header-backdrop").addClass("backdrop-suggest");
      $(".form-search-header input").css("border-radius", "32px 32px 0 0");
      $("#suggest-search-header").css("border-top", "1px solid #c9c9c9");
      $("body").css("overflow", "hidden");
      $(".header").css("z-index", "200");
      $("#suggest-search-header").html("");
      let suggestFilm = "";
      if (data.success) {
        if (data.films.length == 0) {
          suggestFilm = `<div class="empty-data py-4 d-flex justify-content-center flex-column align-items-center">
          <img src="/assets/images/admin/empty-data.png" width="150" alt="empty-data">
          <h5 class="text-muted">Không tìm thấy bộ phim nào</h5>
          <span class="text-muted">Hãy thử tìm kiếm với nội dung chính xác hơn</span>
        </div>`;
        } else {
          suggestFilm = data.films
            .map((film) => {
              return `<a href="/film/${film.slug}" class="link-dark" style="text-decoration: none;">
              <div class="suggest-item">
                <div class="suggest-content">
                  <div class="suggest-image">
                    <img src="/assets/images/${film.image}"
                      alt="">
                  </div>
                  <div class="suggest-detail">
                    <span>${film.name}</span>
                    <span class="text-muted">Khởi chiếu: ${moment(film.premiere).locale("vi").format("DD-MM-YYYY")}</span>
                  </div>
                </div>
                <div class="suggest-star">
                  ${film.avgStar} <i class="fa-solid fa-star text-warning"></i>
                </div>
              </div>
            </a>`;
            })
            .join("");
          suggestFilm += `<div class="suggest-footer">
                            <a href="/film/search?name=${name}" class="btn see-more-suggest text-light">Xem tất cả kết quả <i class="fa-solid fa-arrow-right"></i></a>
                          </div>`;
        }
      }

      $("#suggest-search-header").append(suggestFilm);
    }, 1000)
  );
  $("#form-search-film").keyup(function (event) {
    if (event.keyCode === 13) {
      const nameSearch = $("#form-search-film").val();
      const name = convertToSlug(nameSearch);
      localStorage.setItem("searchTextHome", nameSearch);
      window.location.href = `/film/search?name=${name}`;
    }
  });
}

async function searchFilm(name) {
  try {
    const res = await fetch(`/film/suggest?name=${name}`);
    const data = await res.json();
    return data;
  } catch (error) {}
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function eventRegister() {
  $("#btn-register").click(async function () {
    const name = $("#register-name").val();
    const email = $("#register-email").val();
    const password = $("#register-password").val();
    const confirmPassword = $("#register-confirm-password").val();

    createError(name.trim() === "", "register-name-err", "Không được để trống");
    createError(
      email.trim() === "",
      "register-email-err",
      "Không được để trống"
    );
    createError(
      password.trim() === "",
      "register-password-err",
      "Không được để trống"
    );
    createError(
      confirmPassword.trim() === "",
      "register-confirm-password-err",
      "Không được để trống"
    );
    if (confirmPassword !== "" && password !== confirmPassword) {
      createError(
        confirmPassword.trim() !== "",
        "register-confirm-password-err",
        "Mật khẩu không trùng khớp"
      );
    }
    if (
      name &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword
    ) {
      $("#spinner-register").addClass("spinner-border");
      $("#btn-register").attr("disabled", "true");
      const res = await register({ name, email, password });
      $("#btn-register").removeAttr("disabled");
      $("#spinner-register").removeClass("spinner-border");
      if (res.code === 409) {
        createError(res.code === 409, "register-email-err", res.msg);
      }
    }
  });
}

function createError(condition, el, msg) {
  let err = $(`#${el}`);
  return condition ? err.text(msg) : err.text("");
}

function eventLogin() {
  $("#btn-login").click(async function () {
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    createError(
      email.trim() === "",
      "login-email-err",
      "Không được để trống email"
    );
    createError(
      password.trim() === "",
      "login-password-err",
      "Không được để trống mật khẩu"
    );
    if ((email, password)) {
      $("#spinner-login").addClass("spinner-border");
      $("#btn-login").attr("disabled", "true");
      await login({ email, password });
      $("#btn-login").removeAttr("disabled");
      $("#spinner-login").removeClass("spinner-border");
    }
  });
}

async function register(data) {
  try {
    let res = await postJson("/register", data);
    if (res.error) {
      toastr.error(res.error.msg, "Đăng ký thất bại!", {
        timeOut: 5000,
      });
    } else {
      window.location.href = "/login";
    }
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

async function login(data) {
  try {
    let res = await postJson("/login", data);
    if (res.error) {
      toastr.error(res.error.msg, "Đăng nhập thất bại!", {
        timeOut: 5000,
      });
    }
    if (res.accessToken) {
      const expiresIn = moment().add(7, "days").format("YYYY-MM-DD");
      document.cookie = `jwt=${res.accessToken};expires=${new Date(expiresIn)}`;

      localStorage.setItem("jwt", `Beaer ${res.accessToken}`);
      window.location.href = "/";
    }
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
    toastr.error(e, "Có lỗi xảy ra", {
      timeOut: 5000,
    });
  }
}

async function postJson(url, data) {
  const token = localStorage.getItem("jwt") || "";

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

$(document).ready(function () {
  $("#header-backdrop").click(function () {
    $(this).removeClass("backdrop-suggest");
    $(".form-search-header input").css("border-radius", "32px");
    $("#suggest-search-header").css("border-top", "none");
    $("#suggest-search-header").html("");
    $("#form-search-film").val("");
    $("body").css("overflow", "auto");
    $(".header").css("z-index", "100");
  });
  const token = localStorage.getItem("jwt");
  if (!token) {
    const btn = `<div id="auth">
    <a href="/login" class="btn btn-primary me-2">Đăng nhập</a>
    <a href="/register" class="btn btn-outline-primary">Đăng ký</a>
    </div>`;
    $("#auth-action").append(btn);
  } else {
    const btn = `<span id="logout" class="btn btn-primary me-2">Đăng xuất</span>`;
    $("#auth-action").append(btn);
  }
  $("#logout").click(function () {
    localStorage.removeItem("jwt");
    window.location.href = "/logout";
  });
});
