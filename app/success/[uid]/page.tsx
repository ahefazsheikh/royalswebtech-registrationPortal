// ./app/success/[uid]/page.tsx (Server Component)

import SuccessClient from "./SuccessClient" // Ensure this path is correct

// 💥 FIX: Component is ASYNC, allowing 'await params'
export default async function SuccessPage({ params }: { params: { uid: string } }) {
  
  // Safely await the parameter object before accessing the 'uid' property
  const uid = (await params).uid

  // Pass the resolved 'uid' as a simple prop to the Client Component
  // This resolves the error: 'Type '{ uid: string; }' is not assignable...'
  return <SuccessClient uid={uid} />
}