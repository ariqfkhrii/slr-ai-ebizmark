import { Head, Link } from '@inertiajs/react';

export default function ForbiddenResearchPlan({ requestedId }: { requestedId: number }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Head title="Akses Ditolak" />

      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center">
          <div className="text-5xl font-extrabold text-gray-900">403</div>
          <h1 className="mt-3 text-2xl font-bold text-gray-800">
            Akses ditolak
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Research plan dengan ID {requestedId} tidak dimiliki oleh akun Anda.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
