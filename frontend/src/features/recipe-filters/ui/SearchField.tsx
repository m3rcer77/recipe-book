import { IconButton, InputAdornment, TextField } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  size?: 'small' | 'medium'
}

export function SearchField({ value, onChange, placeholder = 'Поиск', className, size = 'medium' }: Props) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      size={size}
      slotProps={{
        htmlInput: { 'aria-label': 'Поиск рецептов' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="Очистить поиск" onClick={() => onChange('')}>
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  )
}
