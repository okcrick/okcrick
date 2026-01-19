import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-700 p-4 shadow-md text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold tracking-wider">
          <Link href="/">🏏 CRIC-LIVE</Link>
        </div>
        <div className="space-x-6 font-medium">
          <Link href="/" className="hover:text-blue-200 transition">Home</Link>
          <Link href="/matches" className="hover:text-blue-200 transition">All Matches</Link>
          <Link href="/admin" className="bg-yellow-500 px-4 py-2 rounded-lg text-blue-900 font-bold hover:bg-yellow-400">
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  );
}
