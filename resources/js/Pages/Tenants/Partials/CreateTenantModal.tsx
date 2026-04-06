import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";
import SuffixSelect from "@/Components/SuffixSelect";

export default function CreateTenantModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    // THE FIX: Destructure 'transform' from useForm
    const { data, setData, post, processing, errors, reset, clearErrors, transform } =
        useForm({
            first_name: "",
            middle_initial: "",
            last_name: "",
            suffix: "",
            company_name: "",
            contact_number: "",
            province: "",
            municipality: "",
            barangay: "",
            street: "",
        });

    const [locationData, setLocationData] = useState<any>(null);
    const [provinces, setProvinces] = useState<string[]>([]);
    const [municipalities, setMunicipalities] = useState<string[]>([]);
    const [barangays, setBarangays] = useState<string[]>([]);

    useEffect(() => {
        if (show && !locationData) {
            fetch("/data/locations.json")
                .then((res) => res.json())
                .then((json) => {
                    setLocationData(json);
                    const provList: string[] = [];
                    Object.keys(json).forEach((regionKey) => {
                        provList.push(...Object.keys(json[regionKey].province_list));
                    });
                    setProvinces(provList.sort());
                })
                .catch((err) => console.error("Failed to load locations", err));
        }
    }, [show]);

    const handleProvinceChange = (prov: string) => {
        setData((prev) => ({ ...prev, province: prov, municipality: "", barangay: "" }));
        setBarangays([]);
        if (!prov || !locationData) return setMunicipalities([]);

        for (const regionKey in locationData) {
            const provs = locationData[regionKey].province_list;
            if (provs[prov]) {
                setMunicipalities(Object.keys(provs[prov].municipality_list).sort());
                break;
            }
        }
    };

    const handleMunicipalityChange = (mun: string) => {
        setData((prev) => ({ ...prev, municipality: mun, barangay: "" }));
        if (!mun || !locationData || !data.province) return setBarangays([]);

        for (const regionKey in locationData) {
            const provs = locationData[regionKey].province_list;
            if (provs[data.province]) {
                const muns = provs[data.province].municipality_list;
                if (muns[mun]) {
                    setBarangays(muns[mun].barangay_list.sort());
                    break;
                }
            }
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // THE FIX: Use transform() before post() to format data!
        transform((currentData: any) => {
            const fullAddress = [currentData.street, currentData.barangay, currentData.municipality, currentData.province]
                .filter(Boolean)
                .join(", ");

            const finalFirstName = currentData.middle_initial ? `${currentData.first_name} ${currentData.middle_initial}.` : currentData.first_name;
            const finalLastName = currentData.suffix ? `${currentData.last_name} ${currentData.suffix}` : currentData.last_name;

            return {
                ...currentData,
                first_name: finalFirstName,
                last_name: finalLastName,
                address: fullAddress,
            };
        });

        post(route("tenants.store"), {
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon icon="solar:user-plus-bold-duotone" className="w-6 h-6 text-blue-700" />
                    Register Tenant
                </h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5 bg-white rounded-b-2xl overflow-visible">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-4">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">First Name</label>
                        <input type="text" value={data.first_name} onChange={(e) => setData("first_name", e.target.value.replace(/[^a-zA-ZñÑ\s\-,]/g, ""))} className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors" placeholder="e.g. Juan" required />
                        {errors.first_name && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.first_name}</p>}
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block text-center">M.I.</label>
                        <input type="text" maxLength={2} value={data.middle_initial} onChange={(e) => setData("middle_initial", e.target.value.replace(/[^a-zA-ZñÑ]/g, "").toUpperCase())} className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 text-center focus:border-blue-600 focus:ring-0 transition-colors" placeholder="e.g. C" />
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Last Name</label>
                        <input type="text" value={data.last_name} onChange={(e) => setData("last_name", e.target.value.replace(/[^a-zA-ZñÑ\s\-,]/g, ""))} className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors" placeholder="e.g. Dela Cruz" required />
                        {errors.last_name && <p className="text-rose-600 text-xs font-bold mt-1.5">{errors.last_name}</p>}
                    </div>
                    <div className="col-span-6 sm:col-span-2 flex flex-col justify-end pb-0.5">
                        <SuffixSelect value={data.suffix} onChange={(val: any) => setData("suffix", val)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Business / Company <span className="text-[10px] text-slate-500 font-normal ml-1">(Optional)</span></label>
                        <input type="text" value={data.company_name} onChange={(e) => setData("company_name", e.target.value)} className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors" placeholder="e.g. Sari-Sari Store" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Contact Number <span className="text-[10px] text-slate-500 font-normal ml-1">(Optional)</span></label>
                        <input type="text" maxLength={11} value={data.contact_number} onChange={(e) => setData("contact_number", e.target.value.replace(/\D/g, ""))} className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors" placeholder="e.g. 09123456789" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-20">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">Province *</label>
                        <SearchableSelect id="province" value={data.province} onChange={(val: any) => handleProvinceChange(val)} options={provinces} placeholder="Select Province" theme="blue" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">Municipality *</label>
                        <SearchableSelect id="municipality" value={data.municipality} onChange={(val: any) => handleMunicipalityChange(val)} options={municipalities} placeholder="Select Municipality" disabled={!data.province} theme="blue" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">Barangay *</label>
                        <SearchableSelect id="barangay" value={data.barangay} onChange={(val: any) => setData("barangay", val)} options={barangays} placeholder="Select Barangay" disabled={!data.municipality} theme="blue" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Street / House No. <span className="text-[10px] text-slate-500 font-normal ml-1">(Optional)</span></label>
                    <input type="text" value={data.street} onChange={(e) => setData("street", e.target.value.replace(/[^a-zA-Z0-9\s\-\.,#]/g, ""))} className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-colors" placeholder="House No. / Street Name" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" disabled={processing || !data.barangay} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm">Save Tenant</button>
                </div>
            </form>
        </Modal>
    );
}