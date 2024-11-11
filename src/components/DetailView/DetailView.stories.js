import React from 'react';
import { DetailView } from './DetailView';

export default {
  title: 'Components/DetailView',
  component: DetailView,
};

const Template = (args) => <DetailView {...args} />;

export const Default = Template.bind({});
Default.args = {};
