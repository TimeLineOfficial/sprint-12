import React from 'react';
import { Button } from '../components/Button';

export default {
  title: 'Component Isolation/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    onClick: { action: 'clicked' },
  },
};

// Phase 2 Prop Matrix Variations
export const Primary = {
  args: {
    primary: true,
    label: 'Primary Action',
  },
};

export const Secondary = {
  args: {
    secondary: true,
    label: 'Secondary Action',
  },
};

export const Disabled = {
  args: {
    primary: true,
    disabled: true,
    label: 'Disabled Button',
  },
};

export const Loading = {
  args: {
    primary: true,
    loading: true,
    label: 'Loading State',
  },
};

export const Small = {
  args: {
    size: 'small',
    label: 'Small Button',
  },
};

export const Large = {
  args: {
    size: 'large',
    label: 'Large Button',
  },
};
