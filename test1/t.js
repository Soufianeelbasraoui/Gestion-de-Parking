


















//Configuration 
const TOTAL_SLOTS = 20; 
const RATE_FIRST_HOUR = 5; 
const RATE_NEXT_HOURS = 3;

// État de l'application 
let parkingSlots = [];
let activeVehicles = [];
let totalSales = 0;

// Initialisation au chargement 
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialiser les places de parking
    for (let i = 1; i <= TOTAL_SLOTS; i++) {
        parkingSlots.push({ number: i, occupied: false });
    }
    
    // 2. Écouteur pour le formulaire
    const form = document.querySelector('form');
    form.addEventListener('submit', handleEntry);

    // 3. Premier rendu de l'interface
    updateUI();
});

// Fonctions Principales

/* Gère l'entrée d'un nouveau véhicule*/
function handleEntry(event) {
    event.preventDefault();

    const plateInput = document.querySelector('input[type="text"]');
    const typeInput = document.querySelector('input[name="vtype"]:checked');
    
    const plate = plateInput.value.trim().toUpperCase();
    const type = typeInput.nextElementSibling.innerText.trim();

    // Validations
    if (!plate) return alert("Veuillez entrer une immatriculation.");
    if (activeVehicles.find(v => v.plateNumber === plate)) {
        return alert("Ce véhicule est déjà stationné.");
    }

    // Trouver la première place disponible

    const freeSlot = parkingSlots.find(s => !s.occupied);
    if (!freeSlot) return alert("Désolé, le parking est complet.");

    // Créer le véhicule
    const newVehicle = {
        plateNumber: plate,
        type: type,
        entryTime: new Date(),
        slotNumber: freeSlot.number
    };

    // Mettre à jour les données
    freeSlot.occupied = true;
    activeVehicles.push(newVehicle);
    // Reset formulaire et UI
    plateInput.value = '';
    updateUI();
}

  // Déclenche la sortie et affiche les informations de facturation
 
function triggerExit(plate) {
    const vehicle = activeVehicles.find(v => v.plateNumber === plate);
    if (!vehicle) return;

    const exitTime = new Date();
    const durationMs = exitTime - vehicle.entryTime;
    
    // Calcul précis de la durée
    const totalMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Calcul du montant (toute heure entamée est due)
    const hoursToCharge = Math.ceil(totalMinutes / 60) || 1;
    let amount = RATE_FIRST_HOUR;
    if (hoursToCharge > 1) {
        amount += (hoursToCharge - 1) * RATE_NEXT_HOURS;
    }


// (ou vous pouvez utiliser une Modal Bootstrap)
const confirmMessage = `--- REÇU DE SORTIE ---
Véhicule: ${plate}
Entrée: ${vehicle.entryTime.toLocaleTimeString()}
Sortie: ${exitTime.toLocaleTimeString()}
Durée: ${hours}h ${minutes}min
-----------------------
TOTAL À PAYER: ${amount} MAD

Confirmer le paiement et la sortie ?`;

    if (confirm(confirmMessage)) {
        finalizeExit(plate, amount);
    }
}

/* Libère la place et encaisse l'argent*/
function finalizeExit(plate, amount) {
    // Ajouter au chiffre d'affaires
    totalSales += amount;

    // Libérer la place
    const vehicle = activeVehicles.find(v => v.plateNumber === plate);
    const slot = parkingSlots.find(s => s.number === vehicle.slotNumber);
    slot.occupied = false;

    // Supprimer des véhicules actifs
    activeVehicles = activeVehicles.filter(v => v.plateNumber !== plate);
    updateUI();
}

// Mise à jour de l'interface (DOM)

function updateUI() {
    // 1. Mise à jour des compteurs (Cards)
    const occupiedCount = activeVehicles.length;
    const freeCount = TOTAL_SLOTS - occupiedCount;
    const occupancyRate = Math.round((occupiedCount / TOTAL_SLOTS) * 100);

    // Ciblage des éléments de la maquette
    document.querySelector('.col-md-4:nth-child(1) h2').innerText = TOTAL_SLOTS;
    document.querySelector('.col-md-4:nth-child(2) h2').innerHTML = `${occupiedCount} <span class="badge bg-warning-subtle text-warning fs-6 ms-2">${occupancyRate}%</span>`;
    document.querySelector('.col-md-4:nth-child(3) h2').innerHTML = `${freeCount} <span class="badge bg-white bg-opacity-25 fs-6 ms-2">Ventes: ${totalSales} MAD</span>`;

    // 2. Mise à jour de la grille visuelle
    const grid = document.querySelector('.parking-row');
    grid.innerHTML = '';
    
    parkingSlots.forEach(slot => {
        const div = document.createElement('div');
        div.className = `slot ${slot.occupied ? 'occupied' : 'free'}`;
        div.style.width = "90px";
        div.style.height = "60px";
        div.style.border = "2px solid #dee2e6";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.borderRadius = "5px";
        div.style.cursor = slot.occupied ? "pointer" : "default";
        div.style.backgroundColor = slot.occupied ? "#cfe2ff" : "#fff";
        
        if (slot.occupied) {
            const v = activeVehicles.find(veh => veh.slotNumber === slot.number);
            div.innerHTML = `<i class="bi bi-car-front-fill text-primary"></i>`;
            div.title = `Cliquer pour sortir ${v.plateNumber}`;
            div.onclick = () => triggerExit(v.plateNumber);
        } else {
            div.innerText = `P${slot.number}`;
            div.style.color = "#adb5bd";
        }
        grid.appendChild(div);
    });

    // 3.Mise à jour du tableau d'activité
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    activeVehicles.slice().reverse().forEach(v => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="icon-circle bg-light text-primary me-3 p-2 rounded-circle"><i class="bi bi-car-front"></i></div>
                    <div><div class="fw-bold">${v.plateNumber}</div><div class="small text-muted">En stationnement</div></div>
                </div>
            </td>
            <td>${v.type}</td>
            <td>${v.entryTime.toLocaleTimeString()}</td>
            <td>Place ${v.slotNumber}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="triggerExit('${v.plateNumber}')">
                    Sortir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}