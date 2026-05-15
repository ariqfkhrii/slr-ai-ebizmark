import { useForm, router, Link } from '@inertiajs/react'
import React, { useState } from 'react'
import { usePage } from '@inertiajs/react'

export default function Dashboard({
    auth,
    researchPlans = [],
}: any){

    const [showProfile, setShowProfile] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const { flash } = usePage<{ flash?: { success?: string } }>().props

    const { data, setData, post, processing, reset } = useForm({
        title: '',
    })

    function submit(e: React.FormEvent) {

        e.preventDefault()

        post('/research-plans', {
            onSuccess: () => {
                reset()
                setShowModal(false)
            }
        })
    }

    function openEditModal(plan: any) {
        setSelectedPlan(plan)
        setData('title', plan.title)
        setShowEditModal(true)
    }

    function openDeleteModal(plan: any) {
        setSelectedPlan(plan)
        setShowDeleteModal(true)
    }

    function updatePlan(e: React.FormEvent) {

        e.preventDefault()

        if (!selectedPlan || !selectedPlan.research_plan_id) return;

        router.put(`/research-plans/${selectedPlan.research_plan_id}`, {
            title: data.title,
        }, {
            onSuccess: () => {
                reset()
                setShowEditModal(false)
            }
        })
    }

    function deletePlan() {

        if (!selectedPlan || !selectedPlan.research_plan_id) return;

        router.delete(`/research-plans/${selectedPlan.research_plan_id}`, {
            onSuccess: () => {
                setShowDeleteModal(false)
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                {flash?.success && (

                    <div className="mb-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl">
                        {flash.success}
                    </div>

                )}
                {/* HEADER */}

                <div className="flex items-center justify-between mb-6">

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Research Plans
                            </h1>

                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">
                                AI
                            </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                            {researchPlans.length} research plan
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* PROFILE DROPDOWN */}
                        <div className="relative">

                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                                    {auth.user.name.charAt(0)}
                                </div>

                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-700">
                                        {auth.user.name}
                                    </p>
                                </div>
                            </button>

                            {showProfile && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-gray-700">
                                            {auth.user.name}
                                        </p>

                                        <p className="text-sm text-gray-500 truncate">
                                            {auth.user.email}
                                        </p>
                                    </div>

                                    <a
                                        href="/settings/profile"
                                        className="block px-4 py-3 hover:bg-gray-100 text-sm text-gray-700"
                                    >
                                        Profile
                                    </a>

                                    <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600"
                                >
                                    Logout
                                </Link>
                                </div>
                            )}
                        </div>

                        {/* BUTTON MODAL */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-xl font-semibold shadow-md transition-all duration-200"
                        >
                            + Buat Baru
                        </button>
                    </div>
                </div>

                <hr className="mb-6" />

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                    {researchPlans.map((plan: any) => (

                        <div
                            key={plan.research_plan_id}
                            className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:shadow-md transition"
                        >

                            <h2 className="font-bold text-gray-800 mb-4 line-clamp-1">
                                {plan.title}
                            </h2>

                            <div className="grid grid-cols-3 gap-2 mb-4">

                                <div className="bg-gray-200 rounded-lg p-2 text-center">
                                    <p className="font-bold text-gray-800">
                                        {plan.scopus_quantity ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Scopus Articles
                                    </p>
                                </div>

                                <div className="bg-gray-200 rounded-lg p-2 text-center">
                                    <p className="font-bold text-gray-800">
                                        {plan.pubmed_quantity ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PubMed Articles
                                    </p>
                                </div>

                                <div className="bg-gray-200 rounded-lg p-2 text-center">
                                    <p className="font-bold text-gray-800">
                                        {plan.extraction_count ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Extraction
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold shadow-md transition-all duration-200"
                                >
                                    Lihat Research
                                </button>

                                <button
                                    onClick={() => openEditModal(plan)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-xl shadow-md transition-all duration-200 font-semibold"
                                >
                                    ✏️
                                </button>

                                <button
                                    onClick={() => openDeleteModal(plan)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl shadow-md transition-all duration-200 font-semibold"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}

                </div>

                {researchPlans.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        Belum ada research plan.
                    </div>
                )}

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Buat Research Plan
                                </h2>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={submit}>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Research Title
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Masukkan title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition-all duration-200"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md transition-all duration-200"
                                    >
                                        Buat Plan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                Edit Research Plan
                            </h2>

                            <p className="text-sm text-gray-500 mb-6">
                                Ubah judul research plan ini.
                            </p>

                            <form onSubmit={updatePlan}>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul Research Plan
                                    </label>

                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition-all duration-200"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md transition-all duration-200"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE MODAL */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-xl text-center">

                            <h2 className="text-4xl font-bold text-slate-800 mb-10">
                                Konfirmasi!
                            </h2>

                            <p className="text-2xl font-semibold text-slate-700 mb-10">
                                Apakah Anda yakin untuk menghapus Research Plan ini?
                            </p>

                            <div className="flex justify-center gap-4">

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-md transition-all duration-200"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={deletePlan}
                                    className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-md transition-all duration-200"
                                >
                                    Yakin
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}