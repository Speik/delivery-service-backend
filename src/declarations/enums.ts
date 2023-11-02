enum PaymentMethod {
  CASH = 'cash',
  BANK_CARD = 'bank-card',
}

enum OrderType {
  DELIVERY = 'delivery',
  TAKEAWAY = 'takeaway',
}

enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  COOKING = 'cooking',
  DELIVERING = 'delivering',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

enum WsOrderEvent {
  STATUS_CHANGE = 'STATUS_CHANGE',
}

export { PaymentMethod, OrderType, OrderStatus, WsOrderEvent };
