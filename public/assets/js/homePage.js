$(function () {
  eventFilterFilm();
  resetLocalstorage();
  const header = $(".form-search-header");
  header.addClass("d-none");
  eventShowTrailer();
  nextWord();
  eventSearchFilmHomePage();
});

function eventSearchFilmHomePage() {
  $("#text-search-home").on(
    "input",
    debounce(async function () {
      const nameSearch = $("#text-search-home").val();
      const name = convertToSlug(nameSearch);
      localStorage.setItem("searchTextHome", nameSearch);
      const data = await searchFilm(name);
      $("#header-backdrop").addClass("backdrop-suggest");
      $(".form-search-home input").css("border-radius", "32px 32px 0 0");
      $("#suggest-search").css("border-top", "1px solid #c9c9c9");
      $("body").css("overflow", "hidden");
      $("#suggest-search").html("");
      let suggestFilm = "";
      if (data.success) {
        if (data.films.length == 0) {
          suggestFilm = `<div class="empty-data my-4 d-flex justify-content-center flex-column align-items-center">
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

      $("#suggest-search").append(suggestFilm);
    }, 1000)
  );
  $(".btn-search-home").click(function () {
    const nameSearch = $("#text-search-home").val();
    const name = convertToSlug(nameSearch);
    window.location.href = `/film/search?name=${name}`;
  });
  $("#text-search-home").keyup(function (event) {
    if (event.keyCode === 13) {
      const nameSearch = $("#text-search-home").val();
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

function eventFilterFilm() {
  $("#film-form-search").change(function () {
    const filterBy = $(this).val();
    let oldPath = window.location.href;
    const pageParam = oldPath.split("?")[1];
    const params = new URLSearchParams(pageParam);
    const currentSort = params.get("sort");
    let newURL;
    if (currentSort != filterBy) {
      oldPath = oldPath.replace(/page=\d+/, "page=" + 1);
    }
    if (oldPath.includes("page=")) {
      if (oldPath.includes("sort=")) {
        newURL = oldPath.replace(/sort=\w+/, "sort=" + filterBy);
      } else {
        newURL = oldPath + "&sort=" + filterBy;
      }
    } else if (oldPath.includes("sort=")) {
      newURL = oldPath.replace(/sort=\w+/, "sort=" + filterBy);
    } else {
      newURL =
        oldPath + (oldPath.includes("?") ? "&" : "?") + "sort=" + filterBy;
    }
    window.location.href = newURL;
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

function eventShowTrailer() {
  $("#listFilm").on("click", ".play-trailer", function () {
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

$(document).ready(function () {
  $("#header-backdrop").click(function () {
    $(this).removeClass("backdrop-suggest");
    $(".form-search-home input").css("border-radius", "32px");
    $("#suggest-search").css("border-top", "none");
    $("#suggest-search").html("");
    $("#text-search-home").val("");
    $("body").css("overflow", "auto");
  });
  const hash = window.location.href;
  const pageParam = hash.split("?")[1];
  const params = new URLSearchParams(pageParam);
  const totalPage = $("#totalPage").val();
  const currentPage = params.get("page") || 1;
  if (currentPage == 1) {
    $(".pre-page").addClass("disabled");
    $(".pre-page a").attr("aria-disabled", "true");
  }
  if (currentPage == totalPage) {
    $(".next-page").addClass("disabled");
    $(".next-page a").attr("aria-disabled", "true");
  }
  $(`.page-bg-color-${currentPage}`).addClass("bg-danger text-white");
  $(".home-page-number").click(function () {
    const pageNumber = $(this).data("home-page");
    let newURL = `?page=${pageNumber}`;
    if (
      hash.includes("page") ||
      (hash.includes("page") && hash.includes("sort"))
    ) {
      newURL = hash.replace(/page=\d+/, "page=" + pageNumber);
    }
    if (hash.includes("sort") && !hash.includes("page")) {
      newURL = hash + "&page=" + pageNumber;
    }
    window.location.href = newURL;
  });
});

function updatePage(pageNumber, currentURL) {
  let newURL;
  if (currentURL.includes("page=")) {
    newURL = currentURL.replace(/page=\d+/, "page=" + pageNumber);
  } else {
    newURL = `${currentURL}?page=${pageNumber}`;
  }
  window.location.href = newURL;
}

function changePage(action) {
  const currentURL = window.location.href;
  let pageParam = parseInt(currentURL.split("?page=")[1]);
  if (!pageParam) {
    pageParam = 1;
  }

  const totalPage = $("#totalPage").val();

  if (action === "pre") {
    if (pageParam == 1) {
      return;
    } else {
      pageParam -= 1;
    }
  } else {
    if (pageParam == totalPage) {
      return;
    } else {
      pageParam += 1;
    }
  }
  updatePage(pageParam, currentURL);
}

$(window).scroll(function () {
  const header = $(".form-search-header");
  if ($(this).scrollTop() > 200) {
    $(".form-search-home").addClass("d-none");
    header.removeClass("d-none");
  } else {
    $(".form-search-home").removeClass("d-none");
    header.addClass("d-none");
  }
});

const reviewWords = ["Phim chiếu rạp", "Đạo diễn", "Diễn viên"];
const span = document.getElementById("reviewSpan");
let currentWordIndex = 0;

function typeEffect(word) {
  let i = 0;
  const letters = word.split("");
  const interval = setInterval(() => {
    if (i < letters.length) {
      const tag = document.createElement("b");
      tag.textContent = letters[i];
      tag.classList.add("typing");
      tag.classList.add("visible");
      span.appendChild(tag);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(clearLetters, 100);
    }
  }, 400);
}

function clearLetters() {
  const letters = span.querySelectorAll(".visible");
  letters.forEach((letter) => {
    letter.classList.remove("visible");
    letter.classList.add("hidden");
  });
  setTimeout(nextWord, 500);
}

function nextWord() {
  if (currentWordIndex === reviewWords.length) {
    currentWordIndex = 0;
  }
  span.innerHTML = "";
  typeEffect(reviewWords[currentWordIndex]);
  currentWordIndex++;
}
