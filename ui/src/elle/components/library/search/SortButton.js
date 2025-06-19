import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import '../../../pages/styles/Library.css';

export default function SortButton({ onChange, selected }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const sortOptions = [
    { key: 'az', label: 'A→Z' },
    { key: 'za', label: 'Z→A' },
    { key: 'newest', label: 'Uuemad' },
    { key: 'oldest', label: 'Vanemad' }
  ];

  const selectedLabel = sortOptions.find(opt => opt.key === selected)?.label || 'Sorteeri';

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        variant="contained"
        className="library-container-sortbutton"
      >
        SORTEERI: {selectedLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {sortOptions.map(opt => (
          <MenuItem
            key={opt.key}
            onClick={() => {
              onChange(opt.key);
              setAnchorEl(null);
            }}
            selected={selected === opt.key}
            sx={{
              fontWeight: selected === opt.key ? 'bold' : 'normal',
              backgroundColor: selected === opt.key ? '#f0f0f0' : 'inherit'
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
