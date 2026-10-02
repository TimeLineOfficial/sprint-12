import React from 'react';
import { NotificationCard } from '../components/NotificationCard';

export default {
  title: 'Component Isolation/NotificationCard',
  component: NotificationCard,
  tags: ['autodocs'],
  argTypes: {
    onAcknowledge: { action: 'acknowledged' },
  },
};

export const DefaultOrderNotification = {
  args: {
    orderId: 'ORD-2026-881',
    customerName: 'Sarah Connor',
    amount: '$48.90',
    items: ['Espresso Double', 'Avocado Toast', 'Cold Brew'],
    nodeId: 'Server-Node-A',
    timestamp: '2 seconds ago',
  },
};

export const InterNodePubSubBroadcast = {
  args: {
    orderId: 'PUB-SUB-ALERT-99',
    customerName: 'Admin Broadcast System',
    amount: '$0.00',
    items: ['Redis Backplane Sync', 'Multi-Node Packet'],
    nodeId: 'Server-Node-B (Redis Bus)',
    timestamp: 'Just now',
  },
};
