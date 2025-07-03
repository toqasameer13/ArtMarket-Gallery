import React, { createContext, useState } from 'react'

export const crudsContext = createContext()

export default function CrudsContextProvider({children}) {
    
    // const artworks = JSON.parse(localStorage.getItem('artworks'))
    
    const [list, setlist] = useState(JSON.parse(localStorage.getItem('artworks')))
    const [biddingWinner, setbiddingWinner] = useState(null)
    const [imgPreview, setimgPreview] = useState(null)
    
    
  return <>
        <crudsContext.Provider value={{
            list,
            setlist,
            biddingWinner,
            imgPreview,
            setimgPreview
            
            
        }}>

        {children}

        </crudsContext.Provider>
    
  </>
}
