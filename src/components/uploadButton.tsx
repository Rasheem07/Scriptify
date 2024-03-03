"use client"
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import React, { useState } from 'react'
import { Button } from './ui/button';

export default function UploadButton() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => {
      if(!v){
        setIsOpen(v);
      }
    }}>
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
           <Button>upload file</Button>
        </DialogTrigger>
        <DialogContent>
          darg & drop file here
        </DialogContent>
    </Dialog>
  )
}
