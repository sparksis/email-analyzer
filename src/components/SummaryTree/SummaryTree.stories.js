import React from 'react';
import SummaryTree from './index';

export default {
  title: 'Components/SummaryTree',
  component: SummaryTree,
};

const Template = (args) => <SummaryTree {...args} />;

export const Default = Template.bind({});
Default.args = {};
