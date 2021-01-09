function logItems(array) {
    const len = array.length;
    for (let index = 0; index < len; index++) {
        const element = array[index];
        console.log(`${index + 1} - ${array[index]}`);
    }
}

logItems(['Mango', 'Poly', 'Ajax', 'Lux', 'Jay', 'Kong']);
logItems([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);