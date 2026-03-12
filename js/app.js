// Initialize scout equipment data
const scoutEquipment = [
    { id: 1, name: 'Tent', quantity: 10, overdue: false },
    { id: 2, name: 'Sleeping Bag', quantity: 15, overdue: true },
    { id: 3, name: 'First Aid Kit', quantity: 5, overdue: false },
    { id: 4, name: 'Compass', quantity: 20, overdue: false }
];

// Load data from localStorage
const loadEquipment = () => {
    const storedData = localStorage.getItem('scoutEquipment');
    return storedData ? JSON.parse(storedData) : scoutEquipment;
};

// Save data to localStorage
const saveEquipment = (equipment) => {
    localStorage.setItem('scoutEquipment', JSON.stringify(equipment));
};

// Add new equipment item
const addItem = (item) => {
    const equipment = loadEquipment();
    item.id = equipment.length ? Math.max(...equipment.map(e => e.id)) + 1 : 1;
    equipment.push(item);
    saveEquipment(equipment);
};

// Edit existing equipment item
const editItem = (updatedItem) => {
    const equipment = loadEquipment();
    const index = equipment.findIndex(e => e.id === updatedItem.id);
    if (index !== -1) {
        equipment[index] = updatedItem;
        saveEquipment(equipment);
    }
};

// Delete equipment item
const deleteItem = (id) => {
    let equipment = loadEquipment();
    equipment = equipment.filter(e => e.id !== id);
    saveEquipment(equipment);
};

// Search and filter functionality
const searchItems = (searchTerm) => {
    const equipment = loadEquipment();
    return equipment.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
};

// Sort items
const sortItems = (key) => {
    const equipment = loadEquipment();
    return equipment.sort((a, b) => (a[key] > b[key]) ? 1 : -1);
};

// Statistics calculation
const calculateStatistics = () => {
    const equipment = loadEquipment();
    const totalItems = equipment.reduce((sum, item) => sum + item.quantity, 0);
    const overdueItems = equipment.filter(item => item.overdue).length;
    return { totalItems, overdueItems };
};

// Check for forfeitures for overdue items
const checkForfeitures = () => {
    const equipment = loadEquipment();
    return equipment.filter(item => item.overdue);
};

// Example usage:
console.log(loadEquipment()); // Load equipment
addItem({ name: 'Flashlight', quantity: 8, overdue: false }); // Add item
editItem({ id: 2, name: 'Sleeping Bag', quantity: 13, overdue: true }); // Edit item
deleteItem(1); // Delete item
console.log(searchItems('Tent')); // Search items
console.log(sortItems('name')); // Sort items
console.log(calculateStatistics()); // Calculate stats
console.log(checkForfeitures()); // Check for forfeitures
