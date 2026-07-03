export default function AddFoodItem({
  form,
  update,
  submitFood,
  saving,
  editingId,
  cancelEdit,
  message,
}) {
  return (
    <section
      id="add-food-form"
      className="mt-6 rounded-xl border border-temple/10 bg-white p-6 shadow-soft"
    >
      <h2 className="font-display text-2xl font-bold text-temple">
        {editingId ? "Edit Food Item" : "Add Food Item"}
      </h2>
      <p className="mt-2 text-sm text-ink/65">
        {editingId
          ? "Update this item's details, then save your changes."
          : "Create a new Pitha, Pana, sweet, or traditional Odisha delicacy for the marketplace."}
      </p>
      <form onSubmit={submitFood} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="input"
            required
            placeholder="Food name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <input
            className="input"
            required
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
          <select
            className="input"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option>Pitha</option>
            <option>Pana</option>
            <option>Sweet</option>
            <option>Festival Special</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <input
            className="input"
            required
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
          <select
            className="input"
            required
            value={form.price_unit}
            onChange={(e) => update("price_unit", e.target.value)}
          >
            <option>Per Piece</option>
            <option>Per Weight</option>
          </select>
          <input
            className="input"
            required
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
          />
          <input
            className="input"
            required
            type="number"
            placeholder="Shelf life days"
            value={form.shelf_life_days}
            onChange={(e) => update("shelf_life_days", e.target.value)}
          />
          <select
            className="input"
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
          >
            <option>In Stock</option>
            <option>Seasonal</option>
            <option>Out of Stock</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="input"
            required
            placeholder="Sizes, e.g. 250g, 500g"
            value={form.sizes}
            onChange={(e) => update("sizes", e.target.value)}
          />
          <input
            className="input"
            placeholder="Festival tag (Optional)"
            value={form.festival_tag}
            onChange={(e) => update("festival_tag", e.target.value)}
          />
          <input
            className="input"
            required
            placeholder="Region of origin"
            value={form.region_origin}
            onChange={(e) => update("region_origin", e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="input"
            required
            type="date"
            value={form.manufacturing_date}
            onChange={(e) => update("manufacturing_date", e.target.value)}
          />
          <input
            className="input"
            required
            type="date"
            value={form.expiry_date}
            onChange={(e) => update("expiry_date", e.target.value)}
          />
        </div>
        <input
          className="input"
          required
          placeholder="Image URL from Cloudinary, MinIO, or any public image URL"
          value={form.image_url}
          onChange={(e) => update("image_url", e.target.value)}
        />
        <input
          className="input"
          required
          placeholder="Short description"
          value={form.short_description}
          onChange={(e) => update("short_description", e.target.value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <textarea
            className="input min-h-28"
            placeholder="Detailed description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <textarea
            className="input min-h-28"
            placeholder="Cultural significance"
            value={form.cultural_significance}
            onChange={(e) => update("cultural_significance", e.target.value)}
          />
          <textarea
            className="input min-h-28"
            placeholder="Ingredients"
            value={form.ingredients}
            onChange={(e) => update("ingredients", e.target.value)}
          />
          <textarea
            className="input min-h-28"
            placeholder="Preparation process"
            value={form.preparation}
            onChange={(e) => update("preparation", e.target.value)}
          />
          <textarea
            className="input min-h-28"
            placeholder="Nutritional information"
            value={form.nutrition}
            onChange={(e) => update("nutrition", e.target.value)}
          />
          <textarea
            className="input min-h-28"
            placeholder="Storage instructions"
            value={form.storage}
            onChange={(e) => update("storage", e.target.value)}
          />
        </div>
        {message && (
          <p className="rounded-md bg-haldi/20 p-3 text-sm font-semibold text-temple">
            {message}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button disabled={saving} className="btn-primary w-fit">
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Food Item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-temple/20 px-4 py-2 text-sm font-semibold text-temple hover:bg-rice transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
} 