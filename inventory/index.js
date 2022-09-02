import fetch from "node-fetch";

async function getTransfers() {
  let res = await fetch(
    "https://high-west-whiskey.myshopify.com/admin/transfers.json",
    {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua":
          '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie: "new_admin=1; _master_udr=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaEpJaWxoWTJFMU9HTmlOaTFpTnpGaUxUUmhOVFV0T0dJMk1TMWhOVFppTURZMU0yRTNOMk1HT2daRlJnPT0iLCJleHAiOiIyMDIzLTExLTIyVDE2OjA4OjI2LjcxM1oiLCJwdXIiOiJjb29raWUuX21hc3Rlcl91ZHIifX0%3D--ec081199c010a13bab5aad03ffb898861f5956a1; _secure_admin_session_id=5bc8acf2870f76a58cc4eba2c269df02; _secure_admin_session_id_csrf=5bc8acf2870f76a58cc4eba2c269df02; koa.sid=13zhMfJbfU_nAOYuKtIjbHYxPviX7l-M; koa.sid.sig=NbedG6rQKOA4x3aVKcs02qK73wA; __ssid=deab3f25-ade4-4e94-87df-90d300b18e45; cart_currency=USD; _y=488b6704-ba4f-40ed-9c4c-6836420d7418; _shopify_y=488b6704-ba4f-40ed-9c4c-6836420d7418; localization=; __stripe_mid=b7ea1126-f425-4233-9f43-4ee727a0cab41d7c7d; _ab=1; _fbp=fb.2.1635462340741.545574114; secure_customer_sig=; storefront_digest=bb6c547e0c097c768015a4b00e0739b4e0ad6730e2417efeb4af6c86df482afb; cart_sig=ee8d80e696920c5f47144deb29db5c9c; bloom_ag=eyJpc01pbmltdW1BZ2UiOnRydWV9; _orig_referrer=; _landing_page=%2F%3Foseid%3DHjqLCDDcMzS2hEGa6rWHcCKg; blog_filters_url=eyJibG9nX2ZpbHRlcnNfdXJsIjoiaHR0cHM6Ly9oaWdoLXdlc3Qtd2hpc2tleS5teXNob3BpZnkuY29tL2Jsb2dzL3JlY2lwZXM%2Fb3NlaWQ9M1ZGQU16OGtzaThDQVZiU3kyb01BWWNtIn0%3D; __kla_id=eyIkcmVmZXJyZXIiOnsidHMiOjE2MzcwMTg3MzgsInZhbHVlIjoiIiwiZmlyc3RfcGFnZSI6Imh0dHBzOi8vaGlnaC13ZXN0LXdoaXNrZXkubXlzaG9waWZ5LmNvbS8/b3NlaWQ9NHBFSzRCcEVFc0ZIQ2ZhSjF1VUVlTTh6In0sIiRsYXN0X3JlZmVycmVyIjp7InRzIjoxNjQyNTU4NjI0LCJ2YWx1ZSI6IiIsImZpcnN0X3BhZ2UiOiJodHRwczovL2hpZ2gtd2VzdC13aGlza2V5Lm15c2hvcGlmeS5jb20vP29zZWlkPWtIdkZ3V1NDQVRNNWJENGJTNDg1TDVlVyJ9fQ==; preview_theme=1; _s=75388db3-E374-453F-B9CE-06ADBC077BEA; _shopify_s=75388db3-E374-453F-B9CE-06ADBC077BEA"

          
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
    }
  );

  let result = await res.json();
  // console.log("transfer json result:", jsonResult);
	const { inventory_transfers } = result;
	console.log(inventory_transfers.length);
}

// getTransfers();


https://high-west-whiskey.myshopify.com/admin/transfers?after=eyJsYXN0X2lkIjozMjgwMzM5MTI5LCJsYXN0X3ZhbHVlIjoiMjAyMS0xMi0wNiAyMjoyMjozMy4wMDAwMDAifQ%3D%3D
