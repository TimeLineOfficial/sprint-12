import React from 'react';
import { Badge } from '../components/Badge';

export default {
  title: 'Component Isolation/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['online', 'offline', 'admin', 'warning', 'error'],
    },
    pulse: { control: 'boolean' },
  },
};

export const Online = {
  args: { status: 'online', text: 'System Online' },
};

export const AdminRoom = {
  args: { status: 'admin', text: 'Admin Room Active' },
};

export const Warning = {
  args: { status: 'warning', text: 'Pub/Sub Delay Alert' },
};

export const ErrorState = {
  args: { status: 'error', text: 'Socket Tunnel Error' },
};
