import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import Slide from '@mui/material/Slide'
import type { TransitionProps } from '@mui/material/transitions'

/** Диалог «выезжает» снизу — используется для форм и подтверждений. */
export const SlideUpTransition = forwardRef(function SlideUpTransition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})
