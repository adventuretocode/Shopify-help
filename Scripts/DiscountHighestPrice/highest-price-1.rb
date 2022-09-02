highest_price_variant_id = nil;
highest_price = Money.new(cents: 0);
discount_code = ["test_code"];
discount_amount = 0.90; # 10% discount;
promo_msg = "Promotion Unlocked!";

if !Input.cart.discount_code.nil? && discount_code.include?(Input.cart.discount_code.code)
  Input.cart.line_items.each do |line_item|
    variant = line_item.variant
    if highest_price < line_item.line_price
      highest_price = line_item.line_price;
      highest_price_variant_id = variant.id;
    end
 end
end

if highest_price_variant_id
  Input.cart.line_items.each do |line_item|
    variant = line_item.variant;
    next unless variant.id == highest_price_variant_id;
    line_item.change_line_price(line_item.line_price * discount_amount, message: promo_msg)
  end
end

Output.cart = Input.cart
