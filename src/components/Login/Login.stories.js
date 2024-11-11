import React from 'react';
import Login from './index';

export default {
  title: 'Components/Login',
  component: Login,
};

const Template = (args) => <Login {...args} />;

export const Default = Template.bind({});
Default.args = {};
