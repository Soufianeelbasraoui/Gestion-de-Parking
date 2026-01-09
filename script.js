
const TOTAL_SLOTS = 18; 
const RATE_FIRST_HOUR = 5; 
const RATE_NEXT_HOURS = 3;

let parkingSlots = [];
let activeVehicles = [];
let totalSales = 0;


document.addEventListener('DOMContentLoaded', () => {
    const savedVehicles = localStorage.getItem('activeVehicles');
    const savedSales = localStorage.getItem('totalSales');

    if (savedVehicles) {
        activeVehicles = JSON.parse(savedVehicles);
        activeVehicles.forEach(v => v.entryTime = new Date(v.entryTime));
    }

    if (savedSales) {
        totalSales = parseFloat(savedSales);
    }

    for (let i = 1; i <= TOTAL_SLOTS; i++) {
   
        const isOccupied = activeVehicles.some(v => v.slotNumber === i);
        parkingSlots.push({ number: i, occupied: isOccupied });
    }
    
    const form = document.querySelector('form');
    form.addEventListener('submit', handleEntry);
    updateUI();
});

function saveData() {
    localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
    localStorage.setItem('totalSales', totalSales.toString());
   
}

function handleEntry(event) {
    event.preventDefault();

    const plateInput = document.querySelector('input[type="text"]');
    const typeInput = document.querySelector('input[name="vtype"]:checked');
    
    const plate = plateInput.value.trim().toUpperCase();
    const type = typeInput.nextElementSibling.innerText.trim();

    if (!plate) return alert("Veuillez entrer une immatriculation.");
    if (activeVehicles.find(v => v.plateNumber === plate)) {
        return alert("Ce véhicule est déjà stationné.");
    }

    const freeSlot = parkingSlots.find(s => !s.occupied);
    if (!freeSlot) return alert("Désolé, le parking est complet.");

    const newVehicle = {
        plateNumber: plate,
        type: type,
        entryTime: new Date(),
        slotNumber: freeSlot.number
    };

    freeSlot.occupied = true;
    activeVehicles.push(newVehicle);

    saveData();
    
    plateInput.value = '';
    updateUI();
}


function triggerExit(plate) {
    const vehicle = activeVehicles.find(v => v.plateNumber === plate);
    if (!vehicle) return;

    const exitTime = new Date();
    const durationMs = exitTime - new Date(vehicle.entryTime);

    const totalMinutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hoursToCharge = Math.ceil(totalMinutes / 60) || 1;

    let amount = RATE_FIRST_HOUR;
    if (hoursToCharge > 1) {
        amount += (hoursToCharge - 1) * RATE_NEXT_HOURS;
    }

    document.getElementById("cPlate").textContent = `Véhicule : ${plate}`;
    document.getElementById("cDuration").textContent = `Durée : ${hours}h ${minutes}min`;
    document.getElementById("cAmount").textContent = `TOTAL À PAYER : ${amount} MAD`;

    document.getElementById("exitCard").classList.remove("d-none");

    document.getElementById("btnConfirm").onclick = () => {
        finalizeExit(plate, amount);
        hideCard();
    };
}
 function hideCard() {
    document.getElementById("exitCard").classList.add("d-none");
}

function finalizeExit(plate, amount) {
    totalSales += amount;

    const vehicleIndex = activeVehicles.findIndex(v => v.plateNumber === plate);
    const vehicle = activeVehicles[vehicleIndex];
    const slot = parkingSlots.find(s => s.number === vehicle.slotNumber);
    
    slot.occupied = false;
    activeVehicles.splice(vehicleIndex, 1);

    saveData();
    updateUI();
}

function updateUI() {
    const occupiedCount = activeVehicles.length;
    const freeCount = TOTAL_SLOTS - occupiedCount;
    const occupancyRate = Math.round((occupiedCount / TOTAL_SLOTS) * 100);

    document.querySelector('.col-md-4:nth-child(1) h2').innerText = TOTAL_SLOTS;
    document.querySelector('.col-md-4:nth-child(2) h2').innerHTML = `${occupiedCount} <span class="badge bg-warning-subtle text-warning fs-6 ms-2">${occupancyRate}%</span>`;
    document.querySelector('.col-md-4:nth-child(3) h2').innerHTML = `${freeCount} <span class="badge bg-white bg-opacity-25 fs-6 ms-2">Ventes: ${totalSales} MAD</span>`;

    const grid = document.querySelector('.parking-row');
    grid.innerHTML = '';
    parkingSlots.forEach(slot => {
        const div = document.createElement('div');
        div.className = `slot ${slot.occupied ? 'occupied' : 'free'}`;
        div.style.cssText = `width:100px; height:80px; border:2px solid #dee2e6; display:flex; align-items:center; justify-content:center; border-radius:5px; cursor:${slot.occupied ? 'pointer':'default'}; background-color:${slot.occupied ? '#cfe2ff':'#fff'};`;
        
        if (slot.occupied) {
            const v = activeVehicles.find(veh => veh.slotNumber === slot.number);
            div.innerHTML = `${v.plateNumber}`;
            div.onclick = () => triggerExit(v.plateNumber);
        } else {
            div.innerText = `P${slot.number}`;
            div.style.color = "#adb5bd";
        }
        grid.appendChild(div);
    });

    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';
    activeVehicles.slice().reverse().forEach(v => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="fw-bold">${v.plateNumber}</div></td>
            <td>${v.type}</td>
            <td>${v.entryTime.toLocaleTimeString()}</td>
            <td>Place ${v.slotNumber}</td>
            <td class="text-end"><button class="btn btn-sm btn-outline-danger" onclick="triggerExit('${v.plateNumber}')">Sortir</button></td>
        `;
        tbody.appendChild(row);
    });
}

