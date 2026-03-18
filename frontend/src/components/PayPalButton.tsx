import { PayPalButtons } from '@paypal/react-paypal-js';
import type { CreateOrderActions, OnApproveActions, OnApproveData } from '@paypal/paypal-js';

interface PayPalButtonProps {
  createOrderHandler: (data: Record<string, unknown>, actions: CreateOrderActions) => Promise<string>;
  onApproveHandler: (data: OnApproveData, actions: OnApproveActions) => Promise<void>;
}

export default function PayPalButton({ createOrderHandler, onApproveHandler }: PayPalButtonProps) {
  return (
    <div className="mt-4">
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
        }}
        createOrder={createOrderHandler}
        onApprove={onApproveHandler}
      />
    </div>
  );
}
