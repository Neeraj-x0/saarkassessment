import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <main className="flex flex-col items-center p-10 bg-white rounded-lg max-w-md w-full mx-4 border border-gray-300">
        <h1 className="text-3xl font-bold text-center mb-6">
          Task Management App
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Internship assessment for{" "}
          <a
            href="https://www.saarktechconsultancy.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Saark Tech Consultancy
          </a>
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 w-full">
          <Link
            href="/register"
            className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="w-full text-center bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Login
          </Link>
        </div>
      </main>
      <footer className="absolute bottom-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Task Management App. All rights reserved.</p>
      </footer>
    </div>
  );
}
