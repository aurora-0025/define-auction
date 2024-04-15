"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import { useToast } from "@/components/ui/use-toast";

const DynamicQrScanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), {
  ssr: false
});


export default function Home() {
  const { toast } = useToast()
  const router = useRouter();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    let value
    value = localStorage.getItem("teamID") || ""
    setId(value)
  }, []);

  useEffect(() => {
    if (id) {
      router.push(`/login?id=${id}`)
    }
  }, [id])
  

  return (

    <main className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Scan Your ID
      </h2>
      <div className="w-[300px] h-[300px] m-5">
        <DynamicQrScanner
          components={{ audio: false }}
          onError={(error) => toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error?.message,
          })}
          onResult={(text, result) => setId(text)} />
      </div>
    </main>
  );
}
