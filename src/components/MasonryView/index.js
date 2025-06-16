import React from 'react';
import styled from 'styled-components';
import { EmailTile } from '../EmailTile';
import './MasonryView.scss';

const MasonryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const MasonryView = ({ emailData }) => {
  return (
    <MasonryContainer>
      {emailData.map(({ sender, emailCount }) => (
        <EmailTile key={sender} sender={sender} emailCount={emailCount} />
      ))}
    </MasonryContainer>
  );
};
