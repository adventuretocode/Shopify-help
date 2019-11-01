
/**
 * 
 * @param {Boolean} isResolved True or False to return resolved or not
 * @returns {Promise}          Promise object represents the post body
 */

const someTimeOut = function(isResolved) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            if(isResolved) {
                resolve("resolved");
            }
            else {
                reject("reject");
            }
            
        }, 1000);
    })
}

const test = async function() {
    try {
        // const testVar = await someTimeOut(true);
        const testVar = await someTimeOut(false);
        console.log("someTimeOut - success: ")
        return testVar;

    } catch (error) {
        console.log("someTimeOut - error: ", error);

        // Must return the error but returning the error
        // Would cause a success on the other side
        // return error;

        // Throwing the error would cause the other end 
        throw error;
    }
}

// This failed because it is return the Promise itself
// console.log(test());

// async function always returns a promise.
// Must use try catch to consume promise properly
test().then(yes => console.log("yes ", yes))
.catch(no => console.log("no ", no));


// Below is a failed attempted 
// Async awaits returns only a promise to be consumed
// It can't be in another try catch block. it would do nothing.
// someFunc async wait, allows for the test to come back 
// rather than just logging the promise
const someFunc = async function () {
    try {
        const tryCatchOutside = await test();
        console.log("someFunc - success: ", tryCatchOutside);
    } catch (error) {
        console.log("someFunc - error: ", error)
    }
}

// someFunc();
