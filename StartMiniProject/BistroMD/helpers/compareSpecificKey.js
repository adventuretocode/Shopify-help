export default (object1, object2, keys) => {
  const changedKeys = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const { recharge, local } = key;
    if (
      ((object1[recharge] == "" || object1[recharge] == null) &&
        object2[local] == "") ||
      object2[local] == null
    ) {
      continue;
    }
    if (object1[recharge] != object2[local]) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
};
