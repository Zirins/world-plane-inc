const els = {
  form: document.getElementById("searchForm"),
  from: document.getElementById("fromInput"),
  to: document.getElementById("toInput"),
  clear: document.getElementById("clearBtn"),
  body: document.getElementById("resultsBody"),
  status: document.getElementById("status"),
  modify: document.getElementById("modifyBtn"),
  returnField: document.getElementById("returnField"),
  tripTypeInputs: Array.from(document.querySelectorAll("input[name='tripType']")),
};

let flightsCache = null;

function normalizeAirport(value) {
  return String(value || "").trim().toUpperCase();
}

function formatPrice(price) {
  const n = Number(price);
  if (Number.isNaN(n)) return "";
  return `$${n.toFixed(0)}`;
}

function setStatus(message, { isError = false } = {}) {
  els.status.textContent = message;
  els.status.classList.toggle("error", isError);
}

function renderEmpty(message) {
  els.body.innerHTML = `<div class="emptyCard">${message}</div>`;
}

function toMinutes(hhmm) {
  const [hh, mm] = String(hhmm || "").split(":").map((x) => Number(x));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function formatDuration(departTime, arriveTime) {
  const dep = toMinutes(departTime);
  const arr = toMinutes(arriveTime);
  if (dep == null || arr == null) return "";

  let diff = arr - dep;
  if (diff < 0) diff += 24 * 60;

  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

function formatStops(stops) {
  if (typeof stops === "string" && stops.trim()) return stops.trim();
  if (typeof stops === "number") return stops === 0 ? "Non-stop" : `${stops} stop`;
  return "Non-stop";
}

function renderResults(flights) {
  if (!flights.length) {
    renderEmpty("No matching flights found.");
    return;
  }

  els.body.innerHTML = flights
    .map((f) => {
      const safeId = String(f.id || "");
      const duration = f.duration || formatDuration(f.departTime, f.arriveTime);
      const stops = formatStops(f.stops);
      const airlineInitials = String(f.airline || "A")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
      return `
        <article class="flightCard">
          <div class="airlineLine">
            <div class="airlineBadge" aria-hidden="true">${airlineInitials}</div>
            <div class="airlineText">
              <div class="airlineName">${f.airline}</div>
              <div class="flightId">${safeId}</div>
            </div>
          </div>

          <div class="timeBlock">
            <div class="timeRow">
              <div class="time">${f.departTime}</div>
              <div class="airport">${f.from}</div>
            </div>
            <div class="timeRow">
              <div class="time">${f.arriveTime}</div>
              <div class="airport">${f.to}</div>
            </div>
          </div>

          <div class="metaBlock">
            <div class="duration">${duration}</div>
            <div class="stops">${stops}</div>
          </div>

          <div class="ctaBlock">
            <button class="selectBtn" data-flight-id="${safeId}">
              Select Flight
            </button>
            <div class="priceLine">${formatPrice(f.price)}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadFlights() {
  if (flightsCache) return flightsCache;

  const res = await fetch("./flights.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load flights.json (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("flights.json must contain an array");
  }

  flightsCache = data;
  return flightsCache;
}

function findFlightById(id) {
  if (!flightsCache) return null;
  return flightsCache.find((f) => String(f.id) === String(id)) || null;
}

async function search() {
  const from = normalizeAirport(els.from.value);
  const to = normalizeAirport(els.to.value);

  if (!from || !to) {
    setStatus("Please enter both airports.", { isError: true });
    renderEmpty("Enter airports above and click Search.");
    return;
  }

  setStatus("Loading flights…");
  renderEmpty("Searching…");

  try {
    const flights = await loadFlights();
    const matches = flights.filter(
      (f) =>
        normalizeAirport(f.from) === from && normalizeAirport(f.to) === to
    );

    setStatus(`${matches.length} flight(s) found for ${from} → ${to}.`);
    renderResults(matches);
    if (els.modify) els.modify.hidden = false;
  } catch (err) {
    setStatus(err.message || "Something went wrong.", { isError: true });
    renderEmpty(
      "Could not load flights. If you opened the file directly, try using a local server."
    );
    if (els.modify) els.modify.hidden = true;
  }
}

function clearUI() {
  els.from.value = "";
  els.to.value = "";
  setStatus("");
  renderEmpty("Search to see available flights.");
  els.from.focus();
  if (els.modify) els.modify.hidden = true;
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  search();
});

els.clear.addEventListener("click", clearUI);

// Event delegation for dynamically rendered buttons
els.body.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-flight-id]");
  if (!btn) return;

  const flightId = btn.getAttribute("data-flight-id");
  const flight = findFlightById(flightId);

  if (!flight) {
    alert("That flight could not be found. Try searching again.");
    return;
  }

  const message = `Reserve flight ${flight.id} (${flight.from} → ${flight.to}) for ${formatPrice(
    flight.price
  )}?`;

  const ok = confirm(message);
  if (ok) {
    alert(`Reservation confirmed!\n\nFlight: ${flight.id}\nRoute: ${flight.from} → ${flight.to}`);
  }
});

function applyTripTypeUI() {
  const selected = els.tripTypeInputs.find((i) => i.checked)?.value;
  const isOneWay = selected === "oneway";
  if (!els.returnField) return;

  els.returnField.style.display = isOneWay ? "none" : "";
  const returnInput = els.returnField.querySelector("input");
  if (returnInput) returnInput.disabled = isOneWay;
}

els.tripTypeInputs.forEach((input) => {
  input.addEventListener("change", applyTripTypeUI);
});
applyTripTypeUI();

if (els.modify) {
  els.modify.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    els.from.focus();
  });
}

// Nice default for demo
els.from.value = "JFK";
els.to.value = "LAX";
setStatus("Tip: click Search to demo.");
