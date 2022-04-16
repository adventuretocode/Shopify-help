const deleteOrder = require("./deleteOrder");

const keysArr = [];


(async () => {
  let keyIndex = 0;
  for (let i = 0; i < array.length; i++) {
    try {
      const element = array[i];
      deleteOrder()
    } catch (error) {
      console.log(error);
      keyIndex = (keyIndex + 1) % keysArr;

    }

    fs.writeFileSync(new URL(`./data/track.txt`, import.meta.url), i.toString())
  }
})();

