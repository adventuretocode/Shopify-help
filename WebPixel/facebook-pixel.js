// Settings --> Custom Events
// /settings/customer_events/pixels

!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 543943883949219);

// integrate third-party pixel tracking
analytics.subscribe("page_viewed", event => {
  fbq('track', 'PageView');
});

analytics.subscribe("product_viewed", async (event) => {
  fbq('track', 'ViewContent', {
    content_ids:  [event.data.productVariant.id],
    content_name: event.data.productVariant.title,
    currency: event.data.productVariant.price.currencyCode, 
    value: event.data.productVariant.price.amount,
  });
});

analytics.subscribe("product_added_to_cart", async (event) => {
  fbq('track', 'AddToCart', {
    content_ids: [event.data.cartLine.merchandise.id],
    content_name: event.data.cartLine.merchandise.product.title,
    currency: event.data.cartLine.merchandise.price.currencyCode,
    value: event.data.cartLine.merchandise.price.amount,
  });
});

analytics.subscribe("checkout_started", async (event) => {
  fbq('track', 'InitiateCheckout');
});
