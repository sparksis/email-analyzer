import React from 'react';
import ToContainer from './ToAddress';

export default {
  title: 'Components/ToAddress',
  component: ToContainer,
};

const Template = (args) => <ToContainer {...args} />;

export const Default = Template.bind({});
Default.args = {
  addresses: ['example1@example.com', 'example2@example.com', 'example3@example.com'],
  onChange: (address) => console.log('Selected address:', address),
};
