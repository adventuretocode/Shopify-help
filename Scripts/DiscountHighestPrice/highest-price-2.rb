highest_price_variant_id = nil;
highest_price = Money.new(cents: 0);
discount_code = ["test_code"];
discount_amount = 0.90; # 10% discount;
promo_msg = "Promotion Unlocked!";

class FindHighestPriceLineItem
  def run (cart)
    highest_price_line_item = nil;
    highest_price = Money.new(cents: 0);
    
    cart.line_items.each do |line_item|
      if highest_price < line_item.line_price
        highest_price = line_item.line_price;
        highest_price_line_item = line_item;
      end
    end
    
    return highest_price_line_item;
  end
end


if !Input.cart.discount_code.nil? && discount_code.include?(Input.cart.discount_code.code)
  highest_price_item = FindHighestPriceLineItem.new().run(Input.cart);
  
  if highest_price_item.quantity > 1
    new_line_item = highest_price_item.split(take: 1)
    new_line_item.change_line_price(highest_price_item.line_price * discount_amount, message: promo_msg)
    Input.cart.line_items << new_line_item
  else
    highest_price_item.change_line_price(highest_price_item.line_price * discount_amount, message: promo_msg)
  end
end

Output.cart = Input.cart
