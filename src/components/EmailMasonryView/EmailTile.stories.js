import React from 'react';
import EmailTile from './EmailTile';

export default {
  title: 'Components/EmailTile',
  component: EmailTile,
};

const Template = (args) => <EmailTile {...args} />;

export const Tiny = Template.bind({});
Tiny.args = {
  sender: 'example1@example.com',
  emailCount: 1,
};

export const Small = Template.bind({});
Small.args = {
  sender: 'example2@example.com',
  emailCount: 3,
};

export const Medium = Template.bind({});
Medium.args = {
  sender: 'example3@example.com',
  emailCount: 7,
};

export const Large = Template.bind({});
Large.args = {
  sender: 'example4@example.com',
  emailCount: 16,
};

export const ExtraLarge = Template.bind({});
ExtraLarge.args = {
  sender: 'example5@example.com',
  emailCount: 20,
};
