# ================================ Customizable Settings ================================
# ================================================================
# Disable Discount Code Use
#
# Any discount codes will be rejected with the entered message.
#
#   - 'REJECTION_MESSAGE' is the message to show when a discount
#     code is rejected
# ================================================================
REJECTION_MESSAGE = 'Discount codes cannot be used during this sale'

# ================================ Script Code (do not edit) ================================
# ================================================================
# DisableDiscountCodesCampaign
#
# Any discount codes will be rejected with the entered message.
# ================================================================
class DisableDiscountCodesCampaign
  def initialize(rejection_message)
    @rejection_message = rejection_message
  end

  def run(cart)
    return if cart.discount_code.nil?

    cart.discount_code.reject(message: @rejection_message)
  end
end

CAMPAIGNS = [
  DisableDiscountCodesCampaign.new(REJECTION_MESSAGE),
]

CAMPAIGNS.each do |campaign|
  campaign.run(Input.cart)
end

Output.cart = Input.cart
