"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DynamicQrScanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), {
  ssr: false
});

export default function Home() {
  const { toast } = useToast()
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [idInput, setIdInput] = useState<string>("");

  const [scannerEnabled, setScannerEnabled] = useState<boolean>(true);

  useEffect(() => {
    let value
    value = localStorage.getItem("teamID") || ""
    setId(value)
  }, []);

  useEffect(() => {
    if (id) {
      setScannerEnabled(false);
    }
    if (!scannerEnabled) {
      router.push(`/login?id=${id}`)
    }
  }, [id, scannerEnabled])  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Scan Your ID or Input Your Team ID To Proceed
      </h2>
      <div className="w-[300px] h-[300px] m-5">
        <DynamicQrScanner
          enabled={scannerEnabled}
          components={{ audio: false, onOff: true }}
          onError={(error) => {
            if (scannerEnabled) {
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error?.message,
              })
            }
            }}
          onResult={(text, result) => setId(text)} />
        <Input type="text" value={idInput} onChange={(e)=> setIdInput(e.target.value)}  />
        <Button onClick={()=> setId(idInput)}>Enter</Button>
      </div>
    </main>
  );
}
