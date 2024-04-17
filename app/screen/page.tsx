"use client"
import React, { useEffect, useState } from 'react'
import { db, rdb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onValue, query, ref } from 'firebase/database';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

function page() {
  const [item, setItem] = useState("")
  const [cost, setcost] = useState(0)
  const [leaderboard, setLeaderboard] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [teamnames, setTeamname] = useState<{ [key: string]: any }>({});


  async function getTeamName() {
    const querySnapshot = await getDocs(collection(db, 'ids'));
    querySnapshot.forEach((doc) => {

      teamnames[doc.id] = doc.data()["name"];
    });
    console.log(teamnames)
  }
  getTeamName()

  useEffect(() => {
    (async () => {
      onValue(query(ref(rdb, 'auction/bids')), (snapshot) => {
        const data = snapshot.val();
        if (snapshot.exists()) {
          const leaderboardArray = Object.entries(data) as [string, number][];
          leaderboardArray.sort(([, priceA]: [string, number], [, priceB]: [string, number]) => priceB - priceA);
          const sortedLeaderboard = Object.fromEntries(leaderboardArray);
          console.log("data", data);
          console.log("sorted leaderboard", sortedLeaderboard);
          setLeaderboard(sortedLeaderboard);
        }
      })
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        onValue(ref(rdb, "auction"), (snapshot) => {
          const data = snapshot.val();
          if (snapshot.exists()) {
            setItem(data["name"])
            setcost(data["currentBid"])
            console.log(item)
          }
        });
      } catch (error) {
      }
    })()
  }, [])

  useEffect(() => {
    if (item && cost && leaderboard) {
      setLoading(false);
    }
  }, [item, cost, leaderboard])

  return (
    <main className="w-full h-full min-h-screen flex flex-col justify-center items-center">
      {!loading ? <>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl p-5">{item}</h1>
        <img src="https://k2bindia.com/wp-content/uploads/2015/08/React.png" className='w-[300px]' />
        <h2 className='text-2xl md:text-4xl p-5'>highest bid: {cost}</h2>
        <div className='max-w-[600px] md:min-w-[400px] min-w-[300px] mx-auto border rounded-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Bid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(leaderboard).map((lb, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>{teamnames[lb]}</TableCell>
                  <TableCell className="text-right">{leaderboard[lb]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </> : <div className='space-y-4 flex flex-col justify-center items-center'>
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-[200px] w-[300px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-[100px] w-[400px]" />
            </div>}
    </main>
  )
}

export default page