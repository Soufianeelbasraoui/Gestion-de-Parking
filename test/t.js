const TOTAL_SLOTS = 12;
let parkingSlots = [];
let vehicles = [];

// Initialisation
function initParking() {
    for (let i = 1; i <= TOTAL_SLOTS; i++) {
        parkingSlots.push({ number: i, occupied: false });
    }
    renderParking();
}

function addVehicle() {
    const plate = document.getElementById("plate").value.trim();
    const type = document.getElementById("type").value;
    const message = document.getElementById("message");

    if (!plate) {
        message.textContent = " Immatriculation obligatoire";
        return;
    }

    if (vehicles.find(v => v.plate === plate)) {
        message.textContent = " Véhicule déjà stationné";
        return;
    }

    const freeSlot = parkingSlots.find(s => !s.occupied);
    if (!freeSlot) {
        message.textContent = " Parking complet";
        return;
    }

    freeSlot.occupied = true;

    vehicles.push({
        plate,
        type,
        entryTime: new Date(),
        slot: freeSlot.number
    });

    message.textContent = "Véhicule ajouté";
    renderVehicles();
    renderParking();
}

function exitVehicle(plate) {
    const index = vehicles.findIndex(v => v.plate === plate);
    const vehicle = vehicles[index];

    const exitTime = new Date();
    const duration = Math.ceil((exitTime - vehicle.entryTime) / (1000 * 60 * 60));

    let price = 5;
    if (duration > 1) price += (duration - 1) * 3;

    alert(`Durée: ${duration}h | Prix: ${price} MAD`);

    parkingSlots.find(s => s.number === vehicle.slot).occupied = false;
    vehicles.splice(index, 1);

    renderVehicles();
    renderParking();
}

function renderVehicles() {
    const list = document.getElementById("vehicleList");
    list.innerHTML = "";

    vehicles.forEach(v => {
        list.innerHTML += `
        <tr>
            <td>${v.plate}</td>
            <td>${v.type}</td>
            <td>${v.slot}</td>
            <td>${v.entryTime.toLocaleTimeString()}</td>
            <td><button onclick="exitVehicle('${v.plate}')">Sortie</button></td>
        </tr>
        `;
    });
}

function renderParking() {
    const parking = document.getElementById("parking");
    parking.innerHTML = "";

    parkingSlots.forEach(slot => {
        parking.innerHTML += `
        <div class="slot ${slot.occupied ? 'occupied' : 'free'}">
            ${slot.number}
        </div>`;
    });
}
initParking();

