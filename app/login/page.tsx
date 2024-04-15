"use client"
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'


export default function Page() {
    const { toast } = useToast();
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [id, setId] = useState<string>("");
    const router = useRouter();
    const searchParams = useSearchParams()
    useEffect(() => {
        (async () => {
            setLoading(true);
            let val
            val = searchParams.get("id") || "";
            if (!val) val = localStorage.getItem("teamID") || "";
            if (!val) {
                setLoading(false);
                router.push("/");
            }
            setId(val)
            try {
                const teamRef = doc(db, "ids", val);
                const teamSnap = await getDoc(teamRef);
                if (teamSnap.exists()) {
                    setTeamName(teamSnap.data().name as string);
                    setLoading(false);
                } else {
                    setLoading(false);
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Cannot Find Team.",
                        description: "please try again after some time."
                    })
                    router.push("/");
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "please try again after some time."
                })
                router.push("/");
            }
        })()
    }, []);

    const login = async (pin: string) => {
        try {
            setSubmitting(true)
            const teamRef = doc(db, "ids", id);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
                if (pin == teamSnap.data().pin as string) {
                    localStorage.setItem("teamID", id);
                    setSubmitting(false);
                    router.push("/bid");
                }
                else {
                    setSubmitting(false)
                    toast({
                        variant: "destructive",
                        title: "Uh oh! You entered the wrong passkey.",
                        description: "check your secret passkey again."
                    })
                }
            } else {
                setSubmitting(false);
                router.push("/");
            }
        } catch (error) {
            setSubmitting(false);
            console.log(error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "try again after some time."
            })
        }

    }

    return (
        <div className='w-full h-full min-h-screen flex flex-col justify-center items-center gap-2'>
            {!loading ? <>
                <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>{teamName}</h1>
                <p className="text-xl text-muted-foreground">
                    Enter Your Secret Passkey!
                </p>
                <div className='p-2 md:p-5 flex '>
                    <InputOTP maxLength={4} value={value}
                        onChange={(value: any) => setValue(value)}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={1} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <Button disabled={value === undefined || (value as string).length !== 4 || submitting} onClick={() => { login(value as unknown as string) }}>{submitting ? "submitting" : "submit"}</Button>
            </> : <>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[100px]" />
            </>}

        </div>
    )
}
