import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { money } from "../../utils/format";

export default function ManageProducts({
  products,
  productsLoading,
  productsError,
  deletingId,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(
    () =>
      products.slice((currentPage - 1) * perPage, currentPage * perPage),
    [products, currentPage, perPage]
  );

  useEffect(() => {
    setPage(1);
  }, [products.length, perPage]);

  return (
    <section className="mt-6 rounded-xl border border-temple/10 bg-white p-6 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-temple">
            Manage Products
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            Edit or remove existing items from the marketplace.
          </p>
        </div>
        <ChevronDown
          className={`shrink-0 text-temple transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
      <>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-temple/10 text-xs font-semibold uppercase tracking-wide text-ink/55">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Category</th>
              <th className="pb-2 pr-4">Price</th>
              <th className="pb-2 pr-4">Stock</th>
              <th className="pb-2 pr-4">Availability</th>
              <th className="pb-2 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsLoading && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ink/50">
                  Loading products...
                </td>
              </tr>
            )}
            {!productsLoading && productsError && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sindoor">
                  {productsError}
                </td>
              </tr>
            )}
            {!productsLoading && !productsError && products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ink/50">
                  No products yet.
                </td>
              </tr>
            )}
            {!productsLoading &&
              !productsError &&
              paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-temple/5">
                  <td className="py-3 pr-4 font-medium text-ink">
                    {product.name}
                  </td>
                  <td className="py-3 pr-4 text-ink/70">
                    {product.category}
                  </td>
                  <td className="py-3 pr-4 text-ink/70">
                    {money(product.price)}
                    {product.price_unit
                      ? ` / ${product.price_unit.replace("Per ", "")}`
                      : ""}
                  </td>
                  <td className="py-3 pr-4 text-ink/70">{product.stock}</td>
                  <td className="py-3 pr-4 text-ink/70">
                    {product.availability}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded-md border border-temple/20 px-3 py-1.5 text-xs font-semibold text-temple hover:bg-temple hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => onDelete(product)}
                        className="rounded-md border border-sindoor/30 px-3 py-1.5 text-xs font-semibold text-sindoor hover:bg-sindoor hover:text-white transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!productsLoading && !productsError && products.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-ink/60">
            <span>
              Showing {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, products.length)} of{" "}
              {products.length}
            </span>
            <select
              className="rounded-md border border-temple/20 px-2 py-1 text-xs"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-temple/20 px-3 py-1.5 text-xs font-semibold text-temple hover:bg-temple hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-temple"
            >
              Previous
            </button>
            <span className="text-ink/60">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-temple/20 px-3 py-1.5 text-xs font-semibold text-temple hover:bg-temple hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-temple"
            >
              Next
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </section>
  );
}