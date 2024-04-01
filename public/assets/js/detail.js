$(function () {
  getReviewStar();
  eventCreateReview();
  resetFormCreateReview();
  eventOpenModalReplyReview();
  eventCreateReplyReview();
  eventLikeReview();
  eventLikeReply();
  eventFetchReviews();
  eventFetchReviewsWithPage();
  eventFilterReviews();
  changePageReview();
  resetLocalstorage();
  eventShowTrailer();
});

function eventShowTrailer() {
  $("#listFilm").on("click", ".play-trailer, .play-trailer-img", function () {
    $("#modalShowFilm").html("");
    const idTrailer = $(this).data("id-trailer");
    const nameFilm = $(this).data("name-trailer");
    const createIframe = `<iframe width="100%" height="432" src="https://www.youtube.com/embed/${idTrailer}"
                  title="${nameFilm}" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>`;
    $("#modalShowFilm").append(createIframe);
  });
  $("#closeModalShowTrailer").click(function () {
    $("#modalShowFilm").html("");
  });
  $("#modalShowTrailer").click(function () {
    $("#modalShowFilm").html("");
  });
}

function resetLocalstorage() {
  $(".view-detail-film").click(function () {
    const link = $(this).data("link-film");
    localStorage.removeItem("oldURL");
    localStorage.removeItem("filterBy");
    localStorage.removeItem("page");
    window.location.href = link;
  });
}

function getReviewStar() {
  $(".star-value").click(function () {
    const star = $(this).data("star");
    $("#create-review-rating").val(star);
  });
}

function eventCreateReview() {
  $("#btn-crate-review").click(async function () {
    const star = $("#create-review-rating").val();
    const content = $("#create-review-content").val();
    const image = $("#create-review-image").prop("files")[0];
    const filmId = $("#film-id").val();
    const formData = new FormData();
    formData.append("star", star);
    formData.append("content", content);
    formData.append("image", image);
    formData.append("film", filmId);
    await createReview(formData, filmId);
    $("#modalCreateReview").modal("hide");
    $(".text-rating").text("");
    eventFetchReviews();
  });
}

async function createReview(data, id) {
  try {
    let res = await postformData(`/film/review/${id}`, data);
    if (res.error) {
      console.error(res.error);
    }
    return res.json();
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

function resetFormCreateReview() {
  $("#btn-open-modal-create-review").click(function () {
    const token = localStorage.getItem("jwt");
    if (!token) {
      toastr.error("Chưa đăng nhập", "Vui lòng đăng nhập!", {
        timeOut: 5000,
      });
      $("#modalCreateReview").modal("hide");
    } else {
      $("#modalCreateReview").modal("show");
      $("#create-review-content").val("");
      $(".star-value").removeClass("clicked");
      $("#create-review-image").prop("value", null);
      $(".text-rating").text("");
    }
  });
}

function eventOpenModalReplyReview() {
  $("#listReview").on("click", ".btn-reply", async function () {
    $("#modalReplyReview").modal("show");
    $("#id-reply-review").val("");
    $("#create-reply-review-content").val("");
    const reviewId = $(this).data("review-id");
    $("#id-reply-review").val(reviewId);
  });
}

function eventCreateReplyReview() {
  $(document).on("click", "#btn-crate-reply-review", async function () {
    const reviewId = $("#id-reply-review").val();
    const content = $("#create-reply-review-content").val();
    const res = await replyReview({ review: reviewId, content }, reviewId);
    console.log(res);
    $("#modalReplyReview").modal("hide");

    eventFetchReviews();
  });
}

async function replyReview(data, id) {
  try {
    let res = await postJson(`/film/reply/${id}`, data);
    if (res.error) {
      console.error(res.error);
    }
    return res;
  } catch (e) {
    console.error("Có lỗi xảy ra", e);
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function eventLikeReview() {
  $("#listReview").on(
    "click",
    ".btn-like-review",
    debounce(async function () {
      const reviewId = $(this).data("review-id");
      const token = localStorage.getItem("jwt") || "";
      const res = await fetch(`/review/like/${reviewId}`, {
        method: "POST",
        headers: {
          authorization: token,
        },
      });
      const data = await res.json();
      const btn_like = $(`.review-like-count-${reviewId}`);
      const likeCount = Number(btn_like.text());
      if (data.isLike === true) {
        $(this).removeClass("liked");
        btn_like.text(likeCount - 1);
      } else {
        $(this).addClass("liked");
        btn_like.text(likeCount + 1);
      }
    }, 500)
  );
}

function eventLikeReply() {
  $("#listReview").on(
    "click",
    ".btn-like-reply",
    debounce(async function () {
      const replyId = $(this).data("reply-id");
      const token = localStorage.getItem("jwt") || "";
      const res = await fetch(`/reply/like/${replyId}`, {
        method: "POST",
        headers: {
          authorization: token,
        },
      });
      const data = await res.json();
      const btn_like = $(`.reply-like-count-${replyId}`);
      const likeCount = Number(btn_like.text());
      if (data.isLike === true) {
        $(this).removeClass("liked");
        btn_like.text(likeCount - 1);
      } else {
        $(this).addClass("liked");
        btn_like.text(likeCount + 1);
      }
    }, 500)
  );
}

async function eventFetchReviews() {
  const page = localStorage.getItem("page") || 1;
  const filterBy = localStorage.getItem("filterBy") || "";
  const url = filterBy !== "" ? `&sort=${filterBy}` : "";
  const data = await fetchReviews(`?page=${page}${url}`);
  if (data.success) {
    renderReviews(data);
  }
}

function changePageReview() {
  $("#listReview").on("click", ".pre-page-review", async function () {
    let currentPage = localStorage.getItem("page");
    if (currentPage == null) {
      currentPage = 1;
    }
    if (currentPage > 1) {
      localStorage.setItem("page", currentPage - 1);
      localStorage.getItem("page");
      eventFetchReviews();
    }
  });
  $("#listReview").on("click", ".next-page-review", async function () {
    let currentPage = localStorage.getItem("page");
    if (currentPage == null) {
      currentPage = 1;
    }
    const totalPage = $("#total-page-review").val();
    if (currentPage < totalPage) {
      localStorage.setItem("page", parseInt(currentPage) + 1);
      localStorage.getItem("page");
      eventFetchReviews();
    }
  });
}

async function fetchReviews(page = "") {
  try {
    const token = localStorage.getItem("jwt") || "";
    const filmId = $("#film-id").val();
    const res = await fetch(`/reviews/${filmId}${page}`, {
      method: "GET",
      headers: {
        authorization: token,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

function eventFetchReviewsWithPage() {
  $("#listReview").on("click", ".fetch-reviews", async function () {
    const page = $(this).data("review-page") || 1;
    localStorage.setItem("page", page);
    const filterBy = localStorage.getItem("filterBy") || "";
    const url = filterBy !== "" ? `&sort=${filterBy}` : "";
    const data = await fetchReviews(`?page=${page}${url}`);
    localStorage.setItem("oldURL", `?page=${page}`);
    if (data.success) {
      renderReviews(data);
    }
  });
}

function renderRatingText(star) {
  let text = "";
  if (star >= 1 && star <= 4) {
    text = "Quá tệ";
  } else if (star >= 5 && star <= 7) {
    text = "Tốt";
  } else if (star >= 8 && star <= 9) {
    text = "Đáng xem";
  } else if (star == 10) {
    text = "Cực phẩm";
  }
  return text;
}

function renderReviews(data) {
  let pages = "";
  for (let i = 1; i <= data.page.totalPage; i++) {
    pages += `<li class="page-item fetch-reviews" data-review-page="${i}"><span class="page-link review-bg-color-${i}" >${i}</span></li>`;
  }
  let reviews = "";
  if (data.reviews.length == 0) {
    reviews = `<h6 class="text-center text-empty">Chưa có đánh giá nào. Hãy là người đánh giá đầu tiên!</h6>`;
    $("#listReview").html("");
    $("#listReview").append(reviews);
  }
  if (data.reviews.length > 0) {
    $(".total-review").html(
      `Tìm thấy <strong>${data.totalReview}</strong> đánh giá`
    );
    reviews = data.reviews.map((item) => {
      let check = false;
      return `<div class="row mt-2 p-2 rounded-3" style="background-color: rgb(239,239,239);">
      <div class="d-flex align-items-center gap-3">
        <div class="card-image">
          <img src="/assets/images/${item.review.author.image}" class="rounded-circle" width="40" height="40" alt="Avatar">
        </div>
        <div class="card-info d-flex flex-column">
          <span class="fw-bold">
            ${item.review.author.name}
          </span>
          <span class="text-muted">
          ${moment(item.review.createdAt).locale("vi").fromNow()}
          </span>
        </div>
      </div>
      <div class="card-content card-content-review">
        <div class="review-star">
          <span class="checked">☆</span> ${item.review.star}/10 · ${renderRatingText(item.review.star)}
        </div>
        <div>
          ${item.review.image !== "undefined" ? `<img class="img-review" src="/assets/images/${item.review.image}" width="100" alt="image">` : ""}
        </div>
        <span>
          ${item.review.content}
        </span>
      </div>
      <div class="action d-flex gap-2 align-items-center mt-2">
        ${item.review.likes
          .map((like) => {
            if (like.id === data.userId) {
              check = true;
            }
          })
          .join("")}
        <div class="d-flex align-items-center gap-1">
          <i style="font-size: 22px;cursor: pointer;" data-review-id="${item.review._id}" class="fa-solid btn-like-review fa-thumbs-up ${check ? "liked" : ""}"></i>
          <span class="review-like-count-${item.review.id}">
            ${item.review.likeCount}
          </span>
        </div>
        <i style="font-size: 22px;cursor: pointer;" data-review-id="${item.review._id}" class="fa-solid fa-reply btn-reply" data-bs-toggle="modal" data-bs-target="#modalReplyReview"></i>
      </div>
    </div>
    <div class="listReplylike">
      <div id="reply-review-${item.review._id}">
        ${
          typeof item.replies !== "undefined"
            ? item.replies
                .map((reply) => {
                  let checkReply = false;
                  reply.likes.map((reply) => {
                    if (reply.id === data.userId) {
                      checkReply = true;
                    }
                  });
                  return `<div class="row mt-2 p-2 rounded-3" style="background-color: rgb(235, 235, 235);margin-left: 5%;">
                    <div class="d-flex align-items-center gap-3">
                      <div class="card-image">
                        <img src="/assets/images/${reply.replyBy.image}" class="rounded-circle" width="40" height="40" alt="Avatar">
                      </div>
                      <div class="card-info d-flex flex-column">
                        <span class="fw-bold">
                          ${reply.replyBy.name}
                        </span>
                        <span>
                        ${moment(reply.createdAt).locale("vi").fromNow()}
                        </span>
                      </div>
                    </div>
                    <div class="card-content">
                      <span>
                        ${reply.content}
                      </span>
                    </div>
                    <div class="action d-flex gap-2 align-items-center mt-2">
                      <div class="d-flex align-items-center gap-1">
                        <i style="font-size: 22px;cursor: pointer;" data-reply-id="${reply._id}" class="fa-solid fa-thumbs-up ${checkReply ? "liked" : ""} btn-like-reply"></i>
                        <span class="reply-like-count-${reply.id}">
                          ${reply.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>`;
                })
                .join("")
            : ""
        }
      </div>
    </div>`;
    });
    $("#listReview").html("");
    $("#listReview").append(reviews.join(""));
  }

  if (data.page.totalPage > 0) {
    $("#listReview").append(`<div class="row mt-4">
    <input type="hidden" id="total-page-review" value="${data.page.totalPage}">
      <ul class="pagination justify-content-center">
      <li class="page-item pre-page-review">
        <span class="page-link" href="#" aria-label="Previous" tabindex="-1" aria-disabled="false">
          <span aria-hidden="true">&laquo;</span>
        </span>
      </li>
      ${pages}
      <li class="page-item next-page-review">
        <span class="page-link" href="#" aria-label="Next" aria-disabled="false">
          <span aria-hidden="true">&raquo;</span>
        </span>
      </li>    
      </ul>
      </div>`);
    const currentPage = data.page.current || 1;
    if (currentPage == 1) {
      $(".pre-page-review").addClass("disabled");
      $(".pre-page-review a").attr("aria-disabled", "true");
    }
    if (currentPage == data.page.totalPage) {
      $(".next-page-review").addClass("disabled");
      $(".next-page-review a").attr("aria-disabled", "true");
    }
    $(`.review-bg-color-${currentPage}`).addClass("bg-danger text-white");
  }
}

function eventFilterReviews() {
  $("#review-form-search").change(async function () {
    const filterBy = $(this).val() || "";
    const oldFilter = localStorage.getItem("filterBy");
    if (filterBy !== oldFilter) {
      localStorage.removeItem("oldURL");
      localStorage.removeItem("filterBy");
      localStorage.removeItem("page");
    }
    const oldUrl = localStorage.getItem("oldURL") || "";
    localStorage.setItem("filterBy", filterBy);
    const url =
      oldUrl !== "" ? `${oldUrl}&sort=${filterBy}` : `?sort=${filterBy}`;
    const data = await fetchReviews(url);
    if (data.success) {
      renderReviews(data);
    }
  });
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

async function postformData(url, formData) {
  try {
    const token = localStorage.getItem("jwt") || "";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: token,
      },
      body: formData,
    });

    if (!res.ok) {
      return toastr.error("Tạo thất bại", "Lỗi!", {
        timeOut: 5000,
      });
    }
    return res;
  } catch (e) {
    console.error(e);
    return false;
  }
}

$(document).ready(function () {
  const searchText = localStorage.getItem("filterBy");
  $("#review-form-search").val(searchText);

  $("#content-action").click(function () {
    const text = $(this).text();
    if (text === "Xem thêm") {
      $(this).text("Thu gọn");
      $("#content h6").removeClass("show-text-2");
    } else {
      $(this).text("Xem thêm");
      $("#content h6").addClass("show-text-2");
    }
  });
  const stars = $(".star-value");
  stars.click(function () {
    const star = $(this).data("star");
    if (star >= 1 && star <= 4) {
      $(".text-rating").html(
        "<span class='btn btn-secondary text-light'>Quá tệ</span>"
      );
    } else if (star >= 5 && star <= 6) {
      $(".text-rating").html(
        "<span class='btn btn-warning text-light'>Tốt</span>"
      );
    } else if (star >= 7 && star <= 9) {
      $(".text-rating").html(
        "<span class='btn btn-success text-light'>Đáng xem</span>"
      );
    } else if (star == 10) {
      $(".text-rating").html(
        "<span class='btn btn-danger text-light'>Cực phẩm</span>"
      );
    }
  });
  stars.each(function () {
    $(this).click(function () {
      stars.removeClass("clicked");
      $(this).addClass("clicked");
    });
  });
});
