let travelData = null;

document.addEventListener("DOMContentLoaded", () => {
  const searchArea = document.getElementById("searchArea");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Navbar behavior: hide search UI on About/Contact (Task 4 condition)
  document.querySelectorAll(".navlinks a").forEach((a) => {
    a.addEventListener("click", () => {
      const page = a.getAttribute("data-page");
      if (page === "home") searchArea.classList.remove("hidden");
      else searchArea.classList.add("hidden");
    });
  });

  // Task 6: Fetch JSON using fetch API
  fetch("travel_recommendation_api.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      travelData = data;
      console.log("Loaded travel data:", data); // Task 6 check
    })
    .catch((err) => {
      console.error("Failed to load JSON:", err);
      setHint("Could not load travel_recommendation_api.json. Run using a local server.");
    });

  // Task 7: Show results only after Search button click
  searchBtn.addEventListener("click", () => {
    const keyword = normalizeKeyword(searchInput.value);

    if (!keyword) {
      clearResults();
      setHint("Type a keyword: beach, temple, or country.");
      return;
    }

    showRecommendations(keyword);
  });

  // Task 9: Reset/Clear button
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearResults();
    setHint("Enter a keyword and click Search to see results.");
  });

  // Contact form (simple UX)
  const contactForm = document.getElementById("contactForm");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks! Your message has been submitted.");
    contactForm.reset();
  });
});

function normalizeKeyword(raw) {
  const k = (raw || "").trim().toLowerCase();
  if (!k) return "";

  // Accept variations (Task 7)
  if (k === "beach" || k === "beaches") return "beach";
  if (k === "temple" || k === "temples") return "temple";
  if (k === "country" || k === "countries") return "country";

  // Also accept punctuation variants like "beach!" "temple," etc.
  const cleaned = k.replace(/[^a-z]/g, "");
  if (cleaned === "beach" || cleaned === "beaches") return "beach";
  if (cleaned === "temple" || cleaned === "temples") return "temple";
  if (cleaned === "country" || cleaned === "countries") return "country";

  return cleaned; // unknown keyword
}

function showRecommendations(keyword) {
  if (!travelData) {
    setHint("Data still loading... try again in a moment.");
    return;
  }

  clearResults();

  let items = [];

  if (keyword === "beach") {
    items = travelData.beaches || [];
    setHint("Showing recommendations for: beach");
  } else if (keyword === "temple") {
    items = travelData.temples || [];
    setHint("Showing recommendations for: temple");
  } else if (keyword === "country") {
    // Flatten: countries -> cities (so each item has imageUrl/description)
    const countries = travelData.countries || [];
    items = countries.flatMap(c => c.cities || []);
    setHint("Showing recommendations for: country");
  } else {
    setHint(`No recommendations found for "${keyword}". Try beach, temple, or country.`);
    return;
  }

  if (!items.length) {
    setHint(`No recommendations found for "${keyword}". Try beach, temple, or country.`);
    return;
  }

  items.slice(0, 6).forEach(renderCard);
}

function renderCard(item) {
  const results = document.getElementById("results");
  if (!results) return;

  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = item.imageUrl;
  img.alt = item.name;

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("p");
  title.className = "card-title";
  title.textContent = item.name;

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = item.description;

  body.appendChild(title);
  body.appendChild(desc);

  // Task 10 (optional): display local time if timeZone exists
  if (item.timeZone) {
    const time = document.createElement("p");
    time.className = "card-time";
    time.textContent = `Local time: ${getTimeInTimeZone(item.timeZone)}`;
    body.appendChild(time);
  }

  card.appendChild(img);
  card.appendChild(body);
  results.appendChild(card);
}

function clearResults() {
  const results = document.getElementById("results");
  if (results) results.innerHTML = "";
}

function setHint(text) {
  const hint = document.getElementById("hintText");
  if (hint) hint.textContent = text;
}

function getTimeInTimeZone(timeZone) {
  const options = { timeZone, hour12: true, hour: "numeric", minute: "2-digit", second: "2-digit" };
  try {
    return new Date().toLocaleTimeString("en-US", options);
  } catch {
    return "Unavailable";
  }
}
