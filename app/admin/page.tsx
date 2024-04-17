"use client"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { db, rdb } from '@/lib/firebase';
import { collection, doc, getDocs, increment, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onValue, query, ref, serverTimestamp, set, update } from 'firebase/database';
import { toast } from '@/components/ui/use-toast';

const auctionSchema = z.object({
    name: z.string().min(1, { message: "Name must be at least 1 character." }),
    minbid: z.coerce.number().min(1, { message: "Min Bid must be atleast 1" }),
    minWinners: z.coerce.number()
})

export default function page() {
    const [loading, setLoading] = useState(true);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [currentAuction, setCurrentAuction] = useState<any>({});
    const [leaderboard, setLeaderboard] = useState<any>({});

    const createAuctionForm = useForm<z.infer<typeof auctionSchema>>({
        resolver: zodResolver(auctionSchema),
        defaultValues: {
            name: "",
            minbid: 0,
            minWinners: 0,
        },
    })

    useEffect(() => {
        return onValue(ref(rdb, "auction"), (snapshot) => {
            const data = snapshot.val();
            if (snapshot.exists()) {
                console.log(data);

                setCurrentAuction(data);
            }
        });
    }, [])

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


    const onAuctionCreate = (values: z.infer<typeof auctionSchema>) => {
        if (currentAuction.running == false) {
            set(ref(rdb, '/auction'), {
                name: values.name,
                running: true,
                createdOn: serverTimestamp(),
                minBid: values.minbid,
                minWinners: values.minWinners,
                currentBid: values.minbid,
                bids: {}
            });
        }
        else {
            toast({
                variant: "destructive",
                title: "Uh oh! something went wrong.",
                description: "An auction is already running."
            })
        }

    }

    const stopCurrentAuction = () => {
        if (currentAuction.running == true) {
            const updates: any = {};
            updates['/auction/running'] = false;
            update(ref(rdb), updates);
            let leaderboardIds = Object.keys(leaderboard);
            console.log(leaderboard);

            for (let i = 0; i < currentAuction.minWinners; i++) {
                let id = leaderboardIds[i];
                if (id) {
                    updateDoc(doc(db, "ids", id), {
                        balance: increment(-leaderboard[id])
                    });
                }
            }

        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! something went wrong.",
                description: "there are no auctions running."
            })
        }
    }

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const querySnapshot = await getDocs(collection(db, "auctions"));
                let newAuctions = querySnapshot.docs
                    .map((doc) => ({ ...doc.data(), id: doc.id }));
                setAuctions(newAuctions);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }

        })()
    }, [])

    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm">
            {loading ? <div className='space-y-2'>
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10" />
            </div> : <>
                {currentAuction.running && <div>
                    <p>{currentAuction.name}</p>
                    <Button onClick={stopCurrentAuction}>STOP</Button>
                </div>}
                {auctions.length == 0 ? <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No auctions found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        start an auction.
                    </p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Start Auction</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Start Auction</DialogTitle>
                                <DialogDescription>
                                    Create a realtime auction.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...createAuctionForm}>
                                <form onSubmit={createAuctionForm.handleSubmit(onAuctionCreate)} className="space-y-8">
                                    <FormField
                                        control={createAuctionForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input type='text' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createAuctionForm.control}
                                        name="minbid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Min Bid</FormLabel>
                                                <FormControl>
                                                    <Input type='number' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createAuctionForm.control}
                                        name="minWinners"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Min Winners</FormLabel>
                                                <FormControl>
                                                    <Input type='number' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter>
                                        <Button type="submit">Create</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div> : <>
                </>}
            </>
            }
        </div>
    )
}
