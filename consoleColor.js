var deleteMessage = "hello world";
var message = "hello world";
// console.log("\u001b[30;1m" + message + "\u001b[0m");
// console.log("\u001b[30m" + message + "\u001b[0m");
let i = 0
while(i < 200) {
    // console.log(`\u001b[3${i};1m${message}"\u001b[0m`);
    // console.log(`\u001b[3${i}m${message}"\u001b[0m`);
    let ranNum = Math.floor(Math.random() * 255) + 1;
    console.log(`\u001b[38;5;${ranNum}m${deleteMessage}"\u001b[0m`);
    i++;
}

while(j < 8) {
    console.log(`\u001b[3${j};1m${message}"\u001b[0m`);
    console.log(`\u001b[3${j}m${message}"\u001b[0m`);
    j++;
}
