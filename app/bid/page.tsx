"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { db, rdb } from '@/lib/firebase';
import { onValue, ref, runTransaction } from 'firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function page() {
  const [currentAuction, setCurrentAuction] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>("");
  const [bid, setBid] = useState(0);
  const [bidding, setBidding] = useState(false);
  const [profile, setProfile] = useState<any>({});

  const searchParams = useSearchParams()
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;    
    setLoading(true);
    const unsub = onSnapshot(doc(db, "ids", id), (doc) => {
      let data = doc.data();
      if (doc.exists()) {        
        setProfile(data!);
        setLoading(false);
      }
    });

    return () => {
      unsub
    };
  }, [id])


  useEffect(() => {
    (async () => {
      try {
        let val
        val = searchParams.get("id") || "";
        if (!val) val = localStorage.getItem("teamID") || "";
        if (!val) {
          setLoading(false);
          router.push("/");
        }
        setId(val)
        onValue(ref(rdb, "auction"), (snapshot) => {
          const data = snapshot.val();
          if (snapshot.exists()) {
            setCurrentAuction(data);
            setLoading(false);
          }
        });
      } catch (error) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "please try again after some time."
        })
      }
    })()
  }, [])

  const placeBid = () => {
    setBidding(true);
    try {
      if (bid > profile.balance) {
        toast({
          variant: "destructive",
          title: "Not enough balance!.",
        })
        setBidding(false);
        return;
      };
      console.log(bid);
      const bidRef = ref(rdb, '/auction');
      runTransaction(bidRef, (auction) => {
        if (auction) {
            console.log(auction);
            
            if (bid > auction.currentBid) {
              auction.currentBid = bid;
              if (!auction.bids) {
                auction.bids = {};
              }
              auction.bids[id] = bid;
            } else {
              setBid(currentAuction.currentBid);
              toast({
                variant: "destructive",
                title: "Uh oh! You Got Out Bidded!.",
              })
            }
        }
        return auction;
      });
      toast({
        variant: "default",
        title: bid.toString(),
        description: "Bid was successfully placed"
      })
      setBidding(false);
    } catch (error) {
      console.log(error);
      setBidding(false);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "please try again after some time."
      })
    }
  }

  return (
    <div
      className="w-full h-full min-h-screen flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm"
    >
      {!loading ? <>
        {currentAuction.running ? <div>
          <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {currentAuction.name}
          </h1>
          <Input value={bid} onChange={event => setBid(+event.target.value)} type='number' />
          <Button disabled={bidding} onClick={placeBid}>Place Bid</Button>
          <p>BALANCE: {profile.balance}</p>
          <p>CURRENT BID: {currentAuction.currentBid}</p>
        </div> :
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No auctions found
            </h3>
            <p className="text-sm text-muted-foreground">
              currently there are no auctions running.
            </p>
          </div>
        } </>
        : <div className='flex flex-col space-y-3 justify-center'>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>}
    </div>
  )
}

export default page