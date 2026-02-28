import React from 'react';
import styled from 'styled-components';

const Tile = styled.div`
  border: 1px solid #ccc;
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TinyTile = styled(Tile)`
  height: 20px;
`;

const SmallTile = styled(Tile)`
  height: 40px;
`;

const MediumTile = styled(Tile)`
  height: 60px;
  display: flex;
  align-items: center;
`;

const LargeTile = styled(Tile)`
  height: 160px;
`;

const ExtraLargeTile = styled(Tile)`
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePhoto = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 10px;
`;

const SubjectPreview = styled.div`
  flex: 1;
  background-color: #f0f0f0;
  height: 100px;
  margin-top: 10px;
`;

const EmailTile = ({ sender, emailCount }) => {
  if (emailCount === 1) {
    return <TinyTile>{sender}</TinyTile>;
  } else if (emailCount < 5) {
    return <SmallTile>{sender}</SmallTile>;
  } else if (emailCount < 15) {
    return (
      <MediumTile>
        <ProfilePhoto />
        <div>{sender}</div>
      </MediumTile>
    );
  } else if (emailCount < 16) {
    return (
      <LargeTile>
        <div>{sender}</div>
        <SubjectPreview />
      </LargeTile>
    );
  } else {
    return <ExtraLargeTile>Placeholder</ExtraLargeTile>;
  }
};

export default EmailTile;
