"use client"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton';
import { rdb } from '@/lib/firebase';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'

export default function page() {
    const [loading, setLoading] = useState(true);
    const [auctions, setAuctions] = useState<any[]>([]);
    useEffect(() => {
        setLoading(true);
        const query = ref(rdb, "auctions");
        setLoading(false);
        return onValue(query, (snapshot) => {
            const data = snapshot.val();

            if (snapshot.exists()) {
                Object.values(data).map((auction) => {
                    setAuctions((auctions) => [...auctions, auction]);
                });
            }
        });
    }, [])

    return (
        <div
            className="w-full h-full min-h-screen flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm"
        >
            {loading ? <div className='space-y-2'>
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10" />
            </div> : <>
                {auctions.length == 0 ? <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No auctions found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        start an auction.
                    </p>
                    <Button className="mt-4">Add Auction</Button>
                </div> : <></>}
            </>
            }
        </div>
    )
}
