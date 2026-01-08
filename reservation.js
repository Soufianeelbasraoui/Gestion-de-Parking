const form = document.querySelector("form");

const infoCard = document.getElementById("infoCard");
const iPlate = document.getElementById("iPlate");
const iType = document.getElementById("iType");
const iTime = document.getElementById("iTime");
const exitBtn = document.getElementById("exitBtn");

function getReservations() {
  return JSON.parse(localStorage.getItem("reservations")) || [];
}

function saveReservations(data) {
  localStorage.setItem("reservations", JSON.stringify(data));
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const plateInput = document.querySelector("input[type='text']");
  const plate = plateInput.value.trim().toUpperCase();
  const type = document.querySelector('input[name="vtype"]:checked')
    .nextElementSibling.innerText;

  if (!plate) {
    alert("Veuillez saisir l'immatriculation");
    return;
  }

  const reservation = {
    plate,
    type,
    entryTime: new Date().toLocaleString(),
    status: "active"
  };

  const reservations = getReservations();
  reservations.push(reservation);
  saveReservations(reservations);

  iPlate.textContent = reservation.plate;
  iType.textContent = reservation.type;
  iTime.textContent = reservation.entryTime;

  infoCard.classList.remove("d-none");

  plateInput.value = "";
});

exitBtn.addEventListener("click", () => {
  let reservations = getReservations();

  const index = reservations.findIndex(
    r => r.plate === iPlate.textContent && r.status === "active"
  );

  if (index !== -1) {
    reservations[index].status = "exited";
    reservations[index].exitTime = new Date().toLocaleString();
    saveReservations(reservations);
  }

  infoCard.classList.add("d-none");
  alert("Véhicule sorti du parking ");
});
