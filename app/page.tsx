// import Image from "next/image";

// export default function Home() {
//   return (
    
//   );
// }


// app/page.tsx
import StravaConnect from '@/components/auth/strava-connect';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">My Strava Dashboard</h1>
      <StravaConnect />
    </main>
  );
}

