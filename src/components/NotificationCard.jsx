import React from 'react';
import './NotificationCard.css';

export const NotificationCard = ({
  orderId = 'ORD-9982-12',
  customerName = 'Walk-in Customer',
  amount = '$24.50',
  items = ['Enterprise Coffee Blend', 'Artisan Pastry'],
  nodeId = 'Server-Node-A',
  timestamp = 'Just now',
  onAcknowledge,
}) => {
  return (
    <div className="notif-card">
      <div className="notif-header">
        <span className="notif-badge">⚡ Real-Time Order Broadcast</span>
        <span className="notif-time">{timestamp}</span>
      </div>
      <div className="notif-body">
        <h4 className="notif-title">{orderId}</h4>
        <p className="notif-customer">Customer: <strong>{customerName}</strong></p>
        <p className="notif-amount">Total: <strong>{amount}</strong></p>
        <div className="notif-items">
          {items.map((item, idx) => (
            <span key={idx} className="notif-item-pill">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="notif-footer">
        <span className="notif-node-tag">Dispatched via {nodeId}</span>
        {onAcknowledge && (
          <button type="button" className="notif-ack-btn" onClick={onAcknowledge}>
            Acknowledge Event
          </button>
        )}
      </div>
    </div>
  );
};
