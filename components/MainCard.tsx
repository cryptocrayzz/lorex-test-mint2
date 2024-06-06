import React, { FunctionComponent } from 'react'

interface MainCardProps {
    children: React.ReactNode
}

const MainCard: FunctionComponent<MainCardProps> =  ({children}) => {
  return (
    <div className='main-card'>
        { children }
    </div>
  )
}

export default MainCard