function foo() {
    var counter = 0;

    console.log("A: " + counter);
    ++counter;

    setTimeout(function () {
        console.log("B: " + counter);
        ++counter;
        setTimeout(function () {
            console.log("C: " + counter);
            ++counter;
        }, 1000);
    }, 1000);

    console.log("D: " + counter);

    ++counter;
}
// foo();
var count = 0;

var ajaxStuff = function () {
    return new Promise(function (resolve, reject) {
        var randomTime = Math.floor(Math.random() * 5) * 1000;
        console.log("Random Time: ", randomTime);
        setTimeout(function () {
            resolve();
        }, randomTime);
    });
}

var recursiveCounting = function () {
    console.log(count);
    if (count > 10) {
        return;
    }
    ajaxStuff()
        .then(function () {
            recursiveCounting();
        });
    count++;
}

// recursiveCounting();

