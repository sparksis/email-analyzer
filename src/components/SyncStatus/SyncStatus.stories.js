import React from 'react';
import SyncStatus from './index';

export default {
  title: 'Components/SyncStatus',
  component: SyncStatus,
};

const Template = (args) => <SyncStatus {...args} />;

export const Default = Template.bind({});
Default.args = {};
