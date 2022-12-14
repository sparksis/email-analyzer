import { Box, Chip } from '@mui/material';
import { useState } from 'react';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';

function AddressChip(props) {
    return <Chip sx={{ margin: '0.2em' }}
        avatar={<AlternateEmailRoundedIcon />}
        label={props.children}
        color='secondary'
        variant={props.selected ? 'filled' : 'outlined'}
        onClick={() => props.onClick(props.children)}
    />
}

export default function ToContainer(props) {
    const [selected, setSelected] = useState();
    if (!props.addresses) return null;

    const clickHandler = function (address) {
        if (selected === address) {
            setSelected(null)
            props.onChange(null);
        } else {
            setSelected(address);
            props.onChange(address);
        }
    }
    const addresses = props.addresses.map(address => <AddressChip key={address} selected={selected === address} onClick={clickHandler}>{address}</AddressChip>);

    return <Box>{addresses}</Box>;
}
