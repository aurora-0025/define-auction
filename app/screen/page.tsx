"use client"
import React, { useState } from 'react'

function page() {
    const [cost, setcost] = useState(500)
    const [team, setteam] = useState("deflatted pappadam")
    return (
        <main className="w-full h-full min-h-screen flex flex-col justify-center items-center">
            <h1 className='text-4xl md:text-6xl p-5'>Currently Bidding</h1>
            <img src="https://k2bindia.com/wp-content/uploads/2015/08/React.png" className='w-[300px]'/>
            <h2 className='text-2xl md:text-4xl p-5'>highest bid: {cost}</h2>
            <h2 className='text-2xl md:text-4xl p-5'>{team}</h2>
        </main>
    )
}

export default page