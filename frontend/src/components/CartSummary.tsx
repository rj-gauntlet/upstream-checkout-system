interface CartSummaryProps {
  subtotal: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
}

export default function CartSummary({ subtotal, ctaLabel, onCtaClick, ctaDisabled }: CartSummaryProps) {
  const subtotalNum = parseFloat(subtotal) || 0;
  const tax = subtotalNum * 0.08;
  const total = subtotalNum + tax;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-ocean/5 p-6">
      <h3 className="text-lg font-semibold text-ocean-deeper mb-4">Order Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="text-gray-900">${subtotalNum.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Estimated Tax (8%)</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-ocean/10 pt-3 flex justify-between font-bold text-ocean-deeper text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      {ctaLabel && onCtaClick && (
        <button
          onClick={onCtaClick}
          disabled={ctaDisabled}
          className="w-full mt-6 bg-current-accent hover:bg-current-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
