// The first object is the controlled. 
// As long as the second object contains

// Check to see if the projects are the same
export default (object1, object2) => {
  const changedKeys = [];
  for (let key in object1) {
    if(key == 'id') {
      continue;
    }

    if (object1[key] != object2[key]) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
}
