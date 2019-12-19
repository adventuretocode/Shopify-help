
// Loop over array of titles to extract titles
// Find the mens basic tee version of the product. 
// Get vendor name and clean out the name. 
// Query to see if collection is already made. 
// Build a query graphql query to create smart collections. 


const arrayOfTitle = require("./titlesOfNewProducts.json");
const createSmartCollectionWithGraph = require("./createSmartCollectionWithGraph.js");

createSmartCollectionWithGraph(arrayOfTitle)
  .then(success => console.log("Success", success))
  .catch(error => console.log("Error: Main - ", error));
