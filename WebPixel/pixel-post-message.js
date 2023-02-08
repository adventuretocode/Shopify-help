
console.log("Algolia Custom Pixel Listening")

analytics.subscribe('page_viewed', event => {
  console.log("Algolia - page_viewed");
  // window.parent.postMessage("algolia_page_viewed", "*")
});

analytics.subscribe('product_added_to_cart', event => {
  console.log("Algolia - product_added_to_cart");
  // window.parent.postMessage("algolia_product_added_to_cart", "*")

});

// Subscribe from web pixel app extension
analytics.subscribe("my_custom_event", (event) => {
  console.log("=========== my_custom_event ============ ");
  console.log(event.customData);
  console.log("=========== my_custom_event ============ ");  
});

// ----------------------------------------------------------------------
// Receive message on the other side
