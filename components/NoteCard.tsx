import React, { FunctionComponent } from 'react'

interface NoteCardProps {
    children: React.ReactNode
}

const NoteCard: FunctionComponent<NoteCardProps> = ({children}) => {
  return (
    <div className='note-card'>
        { children }
    </div>
  )
}

export default NoteCard