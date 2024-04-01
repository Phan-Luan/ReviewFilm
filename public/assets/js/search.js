$(function () {
  eventShowTrailer();
  resetLocalstorage();
});

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

$(document).ready(function () {
  const searchText = localStorage.getItem("searchTextHome");
  $("#form-search-film").val(searchText);
  $(".title-search-page").html(
    `Kết quả tìm kiếm cho <strong>${searchText}</strong>`
  );
  let currentURL = window.location.href;
  let urlParams = new URLSearchParams(currentURL);
  let pageParam = urlParams.get("page") || 1;
  const totalPage = $("#totalPage").val();
  if (pageParam == 1) {
    $(".pre-page").addClass("disabled");
    $(".pre-page a").attr("aria-disabled", "true");
  }
  if (pageParam == totalPage) {
    $(".next-page").addClass("disabled");
    $(".next-page a").attr("aria-disabled", "true");
  }
  $(`.page-bg-color-${pageParam}`).addClass("bg-danger text-white");
  $(".page-link-number").click(function (event) {
    event.preventDefault();
    const pageNumber = $(this).data("page-number");
    $(".page-link-number").removeClass("bg-danger text-white");
    $(this).addClass("bg-danger text-white");
    updatePage(pageNumber);
  });
});

function updatePage(pageNumber) {
  const currentURL = window.location.href;
  let newURL;
  if (currentURL.includes("page=")) {
    newURL = currentURL.replace(/page=\d+/, "page=" + pageNumber);
  } else if (currentURL.includes("?")) {
    newURL = currentURL + "&page=" + pageNumber;
  } else {
    newURL = currentURL + "?page=" + pageNumber;
  }
  window.location.href = newURL;
}

function changePage(action) {
  const currentURL = window.location.href;
  const urlParams = new URLSearchParams(currentURL);
  let pageParam = parseInt(urlParams.get("page")) || 1;
  const totalPage = $("#totalPage").val();
  if (action === "pre") {
    if (pageParam == 1) {
      return;
    }
    pageParam -= 1;
  } else {
    if (pageParam == totalPage) {
      return;
    }
    pageParam += 1;
  }
  updatePage(pageParam);
}
