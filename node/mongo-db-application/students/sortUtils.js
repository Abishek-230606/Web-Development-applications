export function applySorting(students, sortParam) {
    // If no sorting return the original list
    if (sortParam === undefined) {
        return students;
    }

    // Create a new array
    let sortedList = [];
    for (let i = 0; i < students.length; i++) {
        sortedList.push(students[i]);
    }

    
    if (sortParam === 'ascname') {
        sortedList.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        });
    }
    
    
    if (sortParam === 'dscname') {
        sortedList.sort((a, b) => {
            if (a.name > b.name) {
                return -1;
            } else if (a.name < b.name) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    
    if (sortParam === 'ascage') {
        sortedList.sort((a, b) => {
            return a.age - b.age;
        });
    }

    
    if (sortParam === 'dscage') {
        sortedList.sort((a, b) => {
            return b.age - a.age;
        });
    }

    
    if (sortParam === 'asccgpa') {
        sortedList.sort((a, b) => {
            return a.cgpa - b.cgpa;
        });
    }

    
    if (sortParam === 'dsccgpa') {
        sortedList.sort((a, b) => {
            return b.cgpa - a.cgpa;
        });
    }

    return sortedList;
}
