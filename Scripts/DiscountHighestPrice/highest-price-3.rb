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

class DiscountOneLineItemWithCodes
  def initialize(discount_code, discount_amount, success_message, is_limit_one)
    @discount_code = discount_code
    @discount_amount = discount_amount
    @success_message = success_message
    @is_limit_one = is_limit_one
  end
  
  def run (cart)
    if !cart.discount_code.nil? && @discount_code && @discount_code.include?(cart.discount_code.code)
      highest_price_item = FindHighestPriceLineItem.new().run(cart);

      if @is_limit_one && highest_price_item.quantity > 1
        partial_line_item = highest_price_item.split(take: 1)
        partial_line_item.change_line_price(partial_line_item.line_price * @discount_amount, message: @success_message)
        position = cart.line_items.find_index(highest_price_item)
        cart.line_items.insert(position + 1, partial_line_item)
      else 
        highest_price_item.change_line_price(highest_price_item.line_price * @discount_amount, message: @success_message)
      end
    end
  end
end

# DiscountOneLineItemWithCodes.new(['DISCOUNT_CODES'], DISCOUNT_AMOUNT, "SUCCESS_MESSAGE",     LIMIT).run(Input.cart)
DiscountOneLineItemWithCodes.new(  ["test_code"],      0.90,            "Promotion Unlocked!", true).run(Input.cart)

Output.cart = Input.cart
