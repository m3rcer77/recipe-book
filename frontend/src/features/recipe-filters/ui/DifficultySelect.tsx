import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { ALL } from '../../../shared/config/constants'
import { DIFFICULTIES } from '../../../entities/recipe/model/types'
import type { DifficultyFilter } from '../model/types'

type Props = { value: DifficultyFilter; onChange: (value: DifficultyFilter) => void }

export function DifficultySelect({ value, onChange }: Props) {
  return (
    <FormControl size="small" sx={{ minWidth: 170 }}>
      <InputLabel id="difficulty-label">Сложность</InputLabel>
      <Select
        labelId="difficulty-label"
        label="Сложность"
        value={value}
        onChange={(e) => onChange(e.target.value as DifficultyFilter)}
      >
        <MenuItem value={ALL}>Все уровни</MenuItem>
        {DIFFICULTIES.map((level) => (
          <MenuItem key={level} value={level}>{level}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
