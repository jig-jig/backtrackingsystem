import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const getInitialDateValue = (dateValue) => {
  if (!dateValue) return "";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().split("T")[0];
};

export default function AddOrdinanceModal({
  categories,
  ordinanceToEdit,
  onClose,
  onRefresh,
}) {
  const isEditMode = !!ordinanceToEdit;

  const [ordinanceNumber, setOrdinanceNumber] = useState(
    () => ordinanceToEdit?.ordinance_number || "",
  );
  const [title, setTitle] = useState(() => ordinanceToEdit?.title || "");
  const [dateEnacted, setDateEnacted] = useState(() =>
    getInitialDateValue(ordinanceToEdit?.date_enacted),
  );
  const [categoryId, setCategoryId] = useState(
    () => ordinanceToEdit?.category_id || "",
  );
  const [remarks, setRemarks] = useState(() => ordinanceToEdit?.remarks || "");
  const [nasFilePath, setNasFilePath] = useState(
    () => ordinanceToEdit?.nas_file_path || "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [allOrdinances, setAllOrdinances] = useState([]);
  const [isAmending, setIsAmending] = useState(
    () =>
      !!ordinanceToEdit?.amends_ordinance_id ||
      !!ordinanceToEdit?.superseded_by_id,
  );

  const [selectedOldOrdinanceId, setSelectedOldOrdinanceId] = useState(
    () =>
      ordinanceToEdit?.amends_ordinance_id ||
      ordinanceToEdit?.superseded_by_id ||
      "",
  );

  const [newStatusForOld, setNewStatusForOld] = useState(
    () => ordinanceToEdit?.amended_ordinance_status || "Amended",
  );
  const [status] = useState(() => ordinanceToEdit?.status || "Active");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLookupOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/ordinances", {
          headers: { Authorization: token },
          params: { limit: 200 },
        });

        if (!res.data.success) return;

        const filtered =
          isEditMode && ordinanceToEdit
            ? res.data.ordinances.filter((o) => o.id !== ordinanceToEdit.id)
            : res.data.ordinances;

        setAllOrdinances(filtered);
      } catch (err) {
        console.error("Failed to populate linkage records pool.", err);
      }
    };

    loadLookupOptions();
  }, [isEditMode, ordinanceToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    const payload = {
      ordinance_number: ordinanceNumber,
      title,
      date_enacted: dateEnacted,
      category_id: categoryId,
      remarks,
      nas_file_path: nasFilePath,
      status: isEditMode ? status : undefined,
      amends_ordinance_id: isAmending ? selectedOldOrdinanceId : null,
      new_status_for_old: isAmending ? newStatusForOld : null,
    };

    try {
      const token = localStorage.getItem("token");
      const response = isEditMode
        ? await axios.put(
            `http://localhost:5000/api/ordinances/${ordinanceToEdit.id}`,
            payload,
            { headers: { Authorization: token } },
          )
        : await axios.post("http://localhost:5000/api/ordinances", payload, {
            headers: { Authorization: token },
          });

      if (response.data.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      setIsError(true);
      setMessage(
        err.response?.data?.message ||
          "Error occurred while saving modifications.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrdinances = useMemo(() => {
    if (!searchQuery) return allOrdinances;

    const lowerQuery = searchQuery.toLowerCase();
    return allOrdinances.filter(
      (o) =>
        o.ordinance_number.toLowerCase().includes(lowerQuery) ||
        o.title.toLowerCase().includes(lowerQuery),
    );
  }, [allOrdinances, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-auto border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-50 border-b border-slate-100 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditMode
                ? "Edit Enacted Legislation"
                : "Log New Enacted Legislation"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditMode
                ? "Modify tracking properties and system metadata indexes."
                : "Add metadata rows to the backtracking index system."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-semibold"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700"
        >
          {message && (
            <div
              className={`p-3 rounded-lg border text-xs font-semibold ${isError ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}
            >
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Ordinance Number
              </label>
              <input
                type="text"
                required
                value={ordinanceNumber}
                onChange={(e) => setOrdinanceNumber(e.target.value)}
                placeholder="e.g., ORD-2026-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Date Enacted
              </label>
              <input
                type="date"
                required
                value={dateEnacted}
                onChange={(e) => setDateEnacted(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Ordinance Title
            </label>
            <textarea
              required
              rows="2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Full title description text..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Category Assignment
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Choose Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                NAS Document Path Location
              </label>
              <input
                type="text"
                value={nasFilePath}
                onChange={(e) => setNasFilePath(e.target.value)}
                placeholder="e.g., /volume1/storage/file.pdf"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Remarks & Annotations
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional administrative side notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
              <input
                type="checkbox"
                checked={isAmending}
                onChange={(e) => setIsAmending(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              ⚠️ This Ordinance Amends or Repeals a Record
            </label>

            {isAmending && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in fade-in duration-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      New Status For Old Law
                    </label>
                    <select
                      value={newStatusForOld}
                      onChange={(e) => setNewStatusForOld(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Amended">Amended</option>
                      <option value="Repealed">Repealed</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Quick Search Filter
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type No. or Title..."
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Select Old Law Reference Target
                  </label>
                  <select
                    required={isAmending}
                    value={selectedOldOrdinanceId}
                    onChange={(e) => setSelectedOldOrdinanceId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none max-w-full"
                  >
                    <option value="">
                      -- Choose Historical Target Match --
                    </option>
                    {filteredOrdinances.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.ordinance_number} - {o.title.substring(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Saving Changes..."
                : isEditMode
                  ? "Save Modifications"
                  : "Commit Legislation Entry"}
            </button>
          </div>
        </form>
        {/* TAILWIND LOCK DOWN LOADING BLUR SPINNER OVERLAY */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-auto cursor-wait rounded-xl animate-in fade-in duration-100">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-700 tracking-wide mt-3 uppercase animate-pulse">
              Saving...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
