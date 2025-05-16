const openBtn = document.getElementById("openMenu");
const closeBtn = document.getElementById("closeMenu");
const menuOverlay = document.getElementById("menuOverlay");

openBtn.addEventListener("click", () => {
  menuOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
});

closeBtn.addEventListener("click", () => {
  menuOverlay.style.display = "none";
  document.body.style.overflow = "";
});

// --------------------video banner starts here--------------------
const video = document.getElementById("heroVideo");

video.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

// -----------------movie search and grid start here-----------------

const API_KEY = "your API key"; //Enter your API key
const API_URL = "https://api.themoviedb.org/3/search/movie";

const searchInput = document.querySelector(".search-box input");
const suggestionsBox = document.getElementById("suggestions");
const movieGrid = document.getElementById("movie-grid");

let debounceTimeout;

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  clearTimeout(debounceTimeout);

  if (query.length < 2) {
    suggestionsBox.innerHTML = "";
    return;
  }

  debounceTimeout = setTimeout(() => {
    fetch(`${API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        suggestionsBox.innerHTML = "";
        data.results.slice(0, 5).forEach((movie) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span>${movie.title} (${
            (movie.release_date || "").split("-")[0] || "N/A"
          })</span>

            <span class="add-btn">+</span>
          `;

          li.querySelector(".add-btn").addEventListener("click", () => {
            addMovieToGrid(movie);
            suggestionsBox.innerHTML = "";
            searchInput.value = "";
          });

          suggestionsBox.appendChild(li);
        });
      })
      .catch((err) => console.error("Failed to fetch movies:", err));
  }, 300);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    suggestionsBox.innerHTML = "";
  }
});

document.addEventListener("click", (event) => {
  if (!searchInput.contains(event.target)) {
    suggestionsBox.innerHTML = "";
  }
});

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim().length > 0) {
    suggestionsBox.style.display = "block";
  }
});

function togglePlaceholder() {
  const hasCards = movieGrid.querySelectorAll(".card").length > 0;
  const placeholder = movieGrid.querySelector(".placeholder");
  if (placeholder) placeholder.style.display = hasCards ? "none" : "block";
}
function getStarRating(voteAverage) {
  const rating = Math.round(voteAverage) / 2;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let starsHtml = "";

  for (let i = 0; i < fullStars; i++) {
    starsHtml += "★";
  }
  if (halfStar) {
    starsHtml += "☆";
  }
  while (starsHtml.length < 5) {
    starsHtml += "☆";
  }

  return starsHtml;
}

function addMovieToGrid(movie) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
      <button class="remove-btn">&times;</button>
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${
    movie.title
  }" />
      <div class="card-content">
        <h3>${movie.title} <span class="year">(${
    (movie.release_date || "").split("-")[0] || "N/A"
  })</span></h3>
        <p>${
          movie.overview
            ? movie.overview.substring(0, 100) + "…"
            : "No description available."
        }</p>
        <p class="rating">${getStarRating(movie.vote_average)}</p>

      </div>
      
    `;

  card.querySelector(".remove-btn").addEventListener("click", () => {
    card.remove();
    togglePlaceholder();
  });

  movieGrid.appendChild(card);
  togglePlaceholder();
}

// -----------------forms strat here-----------------

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const messageDiv = document.getElementById("form-message");
    messageDiv.innerHTML = "";
    messageDiv.style.color = "red";

    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();
    const agree = form.agree.checked ? "yes" : "";

    const errors = [];
    if (!firstName) errors.push("First name is required.");
    if (!lastName) errors.push("Last name is required.");
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      errors.push("A valid email is required.");
    if (phone && !/^\+\d{9,15}$/.test(phone))
      errors.push("A valid phone number is required.");
    if (!message) errors.push("Message is required.");
    if (agree !== "yes") errors.push("You must agree to the terms.");

    if (errors.length > 0) {
      messageDiv.innerHTML =
        "<ul>" + errors.map((e) => `<li>${e}</li>`).join("") + "</ul>";
      return;
    }

    messageDiv.style.color = "green";
    messageDiv.textContent = "Thank you! Your message has been submitted.";
    form.reset();

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("message", message);
    formData.append("agree", agree);

    fetch("submit.php", {
      method: "POST",
      body: formData,
    }).catch((err) => {
      console.error("Silent error during background email sending:", err);
    });
  });
