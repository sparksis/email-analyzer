import React from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';
import { EmailTile } from './EmailTile';

const MasonryContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const EmailMasonryView = ({ emailData }) => {
  return (
    <MasonryContainer>
      {emailData.map(({ sender, emailCount }) => (
        <EmailTile key={sender} sender={sender} emailCount={emailCount} />
      ))}
    </MasonryContainer>
  );
};

export default EmailMasonryView;
