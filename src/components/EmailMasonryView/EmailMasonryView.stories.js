import React from 'react';
import EmailMasonryView from './EmailMasonryView';

export default {
  title: 'Components/EmailMasonryView',
  component: EmailMasonryView,
};

const Template = (args) => <EmailMasonryView {...args} />;

export const Default = Template.bind({});
Default.args = {
  emailData: [
    { sender: 'example1@example.com', emailCount: 1 },
    { sender: 'example2@example.com', emailCount: 3 },
    { sender: 'example3@example.com', emailCount: 7 },
    { sender: 'example4@example.com', emailCount: 16 },
    { sender: 'example5@example.com', emailCount: 20 },
  ],
};
