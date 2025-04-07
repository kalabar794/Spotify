import React from 'react';
import { Avatar, AvatarProps } from '@mui/material';

interface TrackAvatarProps extends AvatarProps {
  'data-testid'?: string;
}

const TrackAvatar: React.FC<TrackAvatarProps> = (props) => {
  const { 'data-testid': testId, ...avatarProps } = props;
  
  return (
    <div data-testid={testId}>
      <Avatar {...avatarProps} />
    </div>
  );
};

export default TrackAvatar; 