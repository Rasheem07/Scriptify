import ChatWrapper from '@/components/ChatWrapper';
import PdfRenderer from '@/components/PdfRenderer';
import { db } from '@/database';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation';
import React from 'react'

interface ParamsProps{
    params:{
        fileid: string
    }
}

export default async function Page({params}: ParamsProps) {

    const {fileid} = params;

    const {getUser} = getKindeServerSession();
    const user = await getUser();

    if(!user?.id || !user) redirect(`/auth-callback?origin=dashboard/${fileid}`);

    const file = await db.file.findFirst({
        where: {
            id: fileid,
            userId: user.id
        }
    })

    if(!file) notFound();

  return (
    <div className='flex flex-col justify-between flex-1 h-[calc(100vh-56px)] lg:overflow-y-hidden'>
      <div className="mx-auto w-full lg:flex max-w-8xl grow xl:px-2">
        <div className="flex-1 xl:flex">
            <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6 xl:flex-1">
               <PdfRenderer url={file.url}/>
            </div>
        </div>
        <div className="shrink-0 flex-[0.75] lg:w-96 border-t border-gray-200 lg:border-l lg:border-t-0">
            <div className="h-full px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6 xl:flex-1">
               <ChatWrapper fileId={file.id}/>
            </div>
        </div>
      </div>
    </div>
  )
}
